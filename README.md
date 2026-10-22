# IPv4 Fragmentation Simulator

### An Interactive Computer Networks Mini Project

🌐 **Live Website:** [🚀 Open IPv4 Fragmentation Simulator](https://dynamitepranay.github.io/ipv4-fragmentation-simulator/)

## 📌 About the Project

The **IPv4 Fragmentation Simulator** is a web-based educational tool designed to demonstrate how IPv4 packets are divided into smaller fragments when their size exceeds the Maximum Transmission Unit (MTU) of a network.

The simulator allows users to enter a packet size and an MTU to observe the fragmentation process, calculate fragment offsets, understand the More Fragments (MF) flag, and visualize the resulting fragments.

## 🎯 Objectives

- Understand the concept of IPv4 fragmentation.
- Demonstrate the role of the Maximum Transmission Unit (MTU).
- Calculate fragment payload sizes and total sizes.
- Understand fragment offsets and the More Fragments (MF) flag.
- Visualize how a large IPv4 packet is divided into smaller fragments.

## ✨ Features

- **Interactive Simulation:** Enter packet sizes and MTU values.
- **Automatic Fragmentation:** Calculate the fragments required for a packet.
- **Fragment Details:** Display fragment payload sizes, header sizes, total sizes, offsets, and MF flags.
- **Visual Representation:** Observe how the original packet is divided into fragments.
- **Educational Calculations:** Understand the mathematical rules behind fragmentation.
- **Input Validation:** Handle invalid packet sizes and MTU values.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript

## 🧠 Key Networking Concepts

| Concept | Description |
|---|---|
| IPv4 | Internet Protocol version 4, used to address and route packets. |
| MTU | Maximum Transmission Unit, the maximum packet size supported by a network link. |
| IPv4 Header | The header containing information required to process and route an IPv4 packet. |
| Fragment Offset | Indicates the position of a fragment's payload within the original packet, in units of 8 bytes. |
| MF Flag | The More Fragments flag indicates whether additional fragments follow. |
| Payload | The data carried by the IPv4 packet, excluding its header. |

## 🧮 Example Simulation

Consider the following input:

- **Original IPv4 Packet Size:** 4000 bytes
- **MTU:** 1500 bytes
- **IPv4 Header Size:** 20 bytes

The original payload is:

`4000 - 20 = 3980 bytes`

The maximum payload size for each non-final fragment is:

`floor((1500 - 20) / 8) × 8 = 1480 bytes`

The resulting fragments are:

| Fragment | Payload Size | Total Size | Fragment Offset | MF Flag |
|---|---:|---:|---:|---:|
| 1 | 1480 bytes | 1500 bytes | 0 | 1 |
| 2 | 1480 bytes | 1500 bytes | 185 | 1 |
| 3 | 1020 bytes | 1040 bytes | 370 | 0 |

The total transmitted size is **4040 bytes**, including the IPv4 header of each fragment.

## 🚀 How to Use

1. Open the [IPv4 Fragmentation Simulator](https://dynamitepranay.github.io/ipv4-fragmentation-simulator/).
2. Enter the original IPv4 packet size in bytes.
3. Enter the MTU value in bytes.
4. Click the simulation button.
5.
