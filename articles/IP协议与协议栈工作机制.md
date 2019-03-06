# TCP/IP协议与协议栈工作机制

## 协议栈



协议栈是计算机网络协议套件/族的一个具体的软件实现，是网络控制软件。套件是通信协议的定义，而协议栈是它们的软件实现。套件中的单个协议通常是为了一个单一目的而设计的。这种模块化使得设计和评估更容易。由于每个协议模块通常与另外两个协议模块进行通信，通常它们组成协议栈的各个层次。最底层的协议总是处理与通信硬件的低层交互。每个更高层次的协议都增加了更多功能。用户应用程序通常只处理最上层的协议（另请参阅OSI模型）。

应用层的各种网络应用程序基本上都是通过Socket 编程接口(或者说Socket库)来和操作系统内核空间的网络协议栈通信的，比如说BSD Socket，Socket是操作系统为应用程序员提供的API接口，当我们调用Socket API时，背后工作的是操作系统的协议栈。

应用程序通过Socket库中的程序组件来向协议栈发出委托。协议栈分为几个模块，如TCP模块、UDP模块、IP模块。

## 套接字



## 创建套接字

套接字是一个抽象的概念，其实体可以说是协议栈内部一块用于存放控制信息（即控制数据接收发送的信息）的内存空间，其记录着通信对象的IP地址，端口号、通信操作的进行状态，协议栈在执行操作时需要参阅这些信息。例如发送数据需查看IP地址端口号，记录发送后经过的时间、是否响应来决定是否重发。`协议栈是根据套接字中记录的控制信息来工作的` 。

创建套接字时，首先分配一个套接字需要的内存空间，然后向其中写入初始状态。然后将套接字的描述符告知应用程序。描述符相当于区分协议栈中多个套接字的号码牌。

socket类型：

1. 流式socket（SOCK_STREAM ）即TCP socket

   使用TCP 协议，从而保证了数据传输的正确性和顺序性

2. 数据报socket（SOCK_DGRAM ）即UDP socket

   使用UDP协议，数据通过相互独立的报文进行传输，是无序的，并且不保证是可靠、无差错的

3. 原始socket（SOCK_RAW）

   原始套接字允许对底层协议如IP或ICMP进行直接访问，功能强大但使用较为不便，主要用于一些协议的开发。

## 连接至服务器

创建套接字后，应用程序会调用connect，随后协议栈会将本地的套接字与服务器的套接字进行连接。（三次握手）连接的本质是通信双方交换控制信息（例如说客户端将IP地址与端口号告诉服务器）。连接的目的是为了将服务器的IP地址和端口号等信息告知协议栈，客户端首先向服务端发送申请通信的请求。在执行收发数据操作时需要缓冲区，它也是在连接操作中分配的。

控制信息是可以分为两类：

1. 头部中记录的信息
2. 套接字（协议栈中的内存空间）中记录的信息：应用程序传递的信息、通信对象接收到的信息、收发数据操作的执行状态。




1. 连接操作的第一步是在TCP模块处创建表示连接控制信息的头部
2. 通过TCP头部中的发送方和接收方的端口号可以找到要连接的套接字
3. 将头部中的控制位的SYN比特设为1，表示同步，此外设置适当序号和窗口大小。设置的初始序列号是随机的。
4. TCP头部创建好后,TCP模块将信息传递给IP模块并委托它发送，网络包传输到服务器
5. 服务器TCP模块根据信息找到服务器对应套接字后，将套接字写入相应信息，并将状态改为正在连接。
6. 服务端发送响应，将SYN比特及ACK控制位置成1，表示已经收到对应的网络包，将ack数字设为客户端发来的初始序列号+1,即是 ISN + 1.同时也初始化一个序列号isn2。
7. 服务端TCP模块会将TCP头部传递给IP模块，并委托IP模块向客服端返回响应
8. 客户端收到网络包，如果SYN为1则表示连接成功，会向套接字中写入服务器的IP地址和端口号
9. 客户端将ACK位置为1，ack为isn2+1发回服务端，服务端收到返回包，连接全部完成。




## 收发数据

1. 将HTTP请求交给协议栈
    - 协议栈收到数据后，会先将数据存放在内部的发送缓冲区中，等待下一段数据
    - MTU: 一个网络包的最大长度，以太网中一般为1500字节（不包括MAC头部）
    - MSS: 除去头部后，一个网络包所能容纳的TCP数据的最大长度（只包含数据，无头部）
    - 当从应用程序中接收的数据长度超过或接近MSS时再发送，这样就可以避免发送大量小包的问题了
    - 此外，协议栈内部还有一个计时器，一定时间后也会将数据包发送出去（以毫秒为单位）

    发送数据的时间的协调：长度优先则会产生延迟，时间优先会降低网络效率，两个因素的平衡有协议栈的开发者权衡与此同时，协议栈也给用户程序通过指定选项来提供了控制发送时间的选择，比如浏览器一般不会等待填充缓冲区而直接发送，以避免延迟。

2. 数据较大时，会进行拆分，拆分出来的每块数据会加上TCP头部然后被放进单独的网络包中（此时发送缓冲区数据自然超过MSS长度，所以不需要等待后面的数据）

3. 通过ACK号和序号可以确定是否收到了网络包

超时时间：等待返回ACK号的时间，太短会导致网络拥塞，太长会增加重传包的延迟，TCP协议采用了动态调整等待时间的方法（在发送数据时测量ACK号的返回时间，慢则延长等待时间，快则缩短）。

滑动窗口：发送一个包后不等待ACK号返回，直接发送后续的一系列包。有可能超出接受方处理能力，导致接受方缓冲区溢出。接受方会通过TCP头部的窗口字段告诉发送方自己能接受多少数据，能接受的最大数据量为窗口长度。

合并更新窗口长度与ACK号减少包的数量，当需要发送多个ACK号或者多个窗口更新时，都可以减少号或者包的数量，因为只要发送最后的结果就可以了，中间的过程可以省略。

如果响应消息没有到达，协议栈会挂起应用程序的委托

断开操作：

1. 客户端发送FIN
2. 服务器返回ACK
3. 服务器发送FIN
4. 客户端返回ACK

等待时间防止客户端返回ACK号丢失造成服务器重新发送FIN导致客户端若有新的套接字会被断开

TCP断开连接状态：

| **Client**      |                                          |                          | Server          |                                          |                          |
| --------------- | ---------------------------------------- | :----------------------- | --------------- | ---------------------------------------- | ------------------------ |
| **Start State** | **Action**                               | **Transitions To State** | **Start State** | **Action**                               | **Transitions To State** |
| **ESTABLISHED** | **Client Close Step #1 Transmit:** The application using TCP signals that the connection is no longer needed. The client TCP sends a segment with the *FIN* bit set to request that the connection be closed. | **FIN-WAIT-1**           | **ESTABLISHED** | At this stage the server is still in normal operating mode. | **—**                    |
| **FIN-WAIT-1**  | The client, having sent a *FIN*, is waiting for it to both be acknowledged and for the serve to send its own *FIN*. In this state the client can still receive data from the server but will no longer accept data from its local application to be sent to the server. | **—**                    | **ESTABLISHED** | **Client Close Step #1 Receive and Step #2 Transmit:**The server receives the client's *FIN*. It sends an *ACK*to acknowledge the *FIN*. The server must wait for the application using it to be told the other end is closing, so the application here can finish what it is doing. | **CLOSE-WAIT**           |
| **FIN-WAIT-1**  | **Client Close Step #2 Receive:** The client receives the *ACK* for its *FIN*. It must now wait for the server to close. | **FIN-WAIT-2**           | **CLOSE-WAIT**  | The server waits for the application process on its end to signal that it is ready to close. | **—**                    |
| **FIN-WAIT-2**  | The client is waiting for the server's FIN. | **—**                    | **CLOSE-WAIT**  | **Server Close Step #1 Transmit:** The server's TCP receives notice from the local application that it is done. The server sends its *FIN* to the client. | **LAST-ACK**             |
| **FIN-WAIT-2**  | **Server Close Step #1 Receive and Step #2 Transmit:** The client receives the server's *FIN* and sends back an *ACK*. | **TIME-WAIT**            | **LAST-ACK**    | The server is waiting for an *ACK* for the *FIN* it sent. | **—**                    |
| **TIME-WAIT**   | The client waits for a period of time equal to double the maximum segment life (MSL) time, to ensure the *ACK* it sent was received. | **—**                    | **LAST-ACK**    | **Server Close Step #2 Receive:** The server receives the *ACK* to its *FIN* and closes the connection. | **CLOSED**               |
| **TIME-WAIT**   | The timer expires after double the MSL time. | **CLOSED**               | **CLOSED**      | The connection is closed on the server's end. | ** **                    |
| **CLOSED**      | The connection is closed.                | ** **                    | **CLOSED**      | The connection is closed.                | ** **                    |

![](http://www.tcpipguide.com/free/diagrams/tcpclose.png)

TCP与UDP不同知之处：

Reliability: 确保数据被传输导目的地，如果没有则重发

数据流控制：管理数据传输的速度，避免超出接受方能处理的范围（滑动窗口）

TCP提供了一种可靠的面向连接的字节流运输层服务，TCP将用户数据打包构成报文段；它发送数据后启动一个定时器；另一端对收到的数据进行确认，对失序的数据重新排序，丢弃重复数据；TCP提供端到端的流量控制，并计算和验证一个强制性的端到端检验和。

建立一个连接需要三次握手，而终止一个连接要经过4次握手。这由T C P的半关闭（h a l f -c l o s e）造成的。既然一个T C P连接是全双工（即数据在两个方向上能同时传递），因此每个方向必须单独地进行关闭。

TCP校验和：校验和用于检测TCP首部和数据在发送端和接受端之间发生的变动（比如bit翻转，字节被破坏了或者其他发生在packet上的差错），如果接收方检测到检验和有差错，TCP段会被直接丢弃，保证了端到端之间数据流的准确性。使用在TCP或者IPV4连接（IPV6不再使用）

TCP和UDP检验和是一个端到端的检验和，由发送端计算，然后由接收端验证。
TCP和UDP检验和覆盖首部和数据，而IP首部中的检验和只覆盖IP的首部，不覆盖IP数据报中的任何数据。UDP/TCP Checksum 覆盖范围为 伪首部 + TCP/UDP Header + TCP/UDP Payload
pseudo header包括
- The IP Source Address field.
- The IP Destination Address field.
- The IP Protocol field.
- The UDP/TCP Length field.
- Reserved(仅TCP)



TCP的检验和是必需的，而UDP的检验和是可选的。

TCP和UDP计算检验和时，都要加上一个12字节的伪首部。

## UDP

UDP是一个简单的面向datagram的传输层协议，对于应用程序提交的数据，经过协议栈UDP 模块生成UDP datagram再由IP模块添加IP首部MAC首部发送出去，其中无拆分、合并操作，因此应用程序需要选择发送数据大小。

UDP不提供可靠性传输。用于DMS

首部为8 bytes，checksum选项再IPV4中可选，IPV6中必要