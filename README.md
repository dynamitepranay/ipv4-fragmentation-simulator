# IPv4 Fragmentation Simulator

An interactive web-based simulator that demonstrates how IPv4 packets are fragmented according to the Maximum Transmission Unit (MTU).

## 🌐 Live Demo

**[Open IPv4 Fragmentation Simulator]([https://YOUR-GITHUB-USERNAME.github.io/ipv4-fragmentation-simulator/](https://dynamitepranay.github.io/ipv4-fragmentation-simulator/))**

> Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username after enabling GitHub Pages.

## 📌 About the Project

IPv4 fragmentation divides a large IP packet into smaller fragments when the packet exceeds the MTU supported by a network link.

This project visualizes the fragmentation process and calculates fragment payload sizes, total sizes, fragment offsets, and More Fragments (MF) flags.

## ✨ Features

- Enter the original IPv4 packet size and MTU.
- Automatically calculate IPv4 packet fragmentation.
- Display individual fragment payload and total sizes.
- Calculate fragment offsets using 8-byte units.
- Display the More Fragments (MF) flag.
- Visualize packet fragmentation through a diagram and results table.
- Validate user inputs.
- Responsive, browser-based interface.

## 🛠️ Technologies Used

- **HTML5:** Structure of the application.
- **CSS3:** Styling and layout.
- **JavaScript:** Fragmentation calculations and interactive functionality.

## ⚙️ How to Run Locally

1. Download or clone this repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same directory.
3. Open `index.html` in a web browser.

No backend server or additional dependencies are required.

## 🧮 Example

**Input:**
- Original IPv4 packet size: 4000 bytes
- MTU: 1500 bytes
- IPv4 header size: 20 bytes

**Expected Output:**

| Fragment | Payload Size | Total Size | Offset | MF |
|---|---:|---:|---:|---:|
| 1 | 1480 B | 1500 B | 0 | 1 |
| 2 | 1480 B | 1500 B | 185 | 1 |
| 3 | 1020 B | 1040 B | 370 | 0 |

## 📚 Concepts Demonstrated

- IPv4 packet fragmentation
- Maximum Transmission Unit (MTU)
- IPv4 header and payload
- Fragment Offset
- More Fragments (MF) flag
- 8-byte fragment alignment

## 🎯 Objective

To make IPv4 packet fragmentation easier to understand through interactive calculations and visual demonstrations.

## ⚠️ Disclaimer

This is an educational simulator. It calculates and visualizes fragmentation but does not transmit real network packets.

## 👨‍💻 Contributors

- Add team members' names here.

## 📄 License

This project was developed for educational purposes as part of a Computer Networks mini-project.
