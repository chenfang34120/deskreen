# Deskreen CE (Community Edition)

![platform](https://img.shields.io/badge/platform-Windows%20%7C%20MacOS%20%7C%20Linux-lightgrey)
(Over 2M downloads during 5 years since launch)

---

## 🔧 本仓库说明（二开版本）

本项目是基于 [pavlobu/deskreen](https://github.com/pavlobu/deskreen) 的二次开发版本，在保留原有屏幕/窗口共享能力的基础上，新增了以下功能与优化：

### ✨ 新增功能

- **虚拟显示器共享（Windows）**：无需购买 HDMI 假负载硬件，内置 Amyuni usbmmidd_v2 虚拟显示驱动，可在 Windows 上动态添加/移除虚拟屏幕，并把虚拟屏作为共享源投屏到浏览器设备（如 iPad）。
- **系统托盘**：点击窗口右上角关闭按钮时，应用缩回右下角系统托盘而非退出；托盘菜单支持「显示主窗口」与「退出」，单击/双击托盘图标恢复主窗口。

### 🛠 优化项

- **移除 Pro 广告**：删除了「Get Deskreen Pro」捐赠按钮及「仅 Pro 版本支持多客户端」等升级提示，仅保留基础功能。
- **固定连接地址**：房间号由随机生成改为固定值，设备断开重连后连接地址不再变化。
- **修复网卡识别**：支持中文网卡名（如「以太网」「无线局域网」），正确过滤虚拟网卡（Docker / Hyper-V / VMware / VirtualBox 等），避免误识别到虚拟网段的 IP。

### 使用虚拟显示器功能

1. 运行应用后连接浏览器设备，在「选择共享源」界面选择「共享整个屏幕」。
2. 点击「添加虚拟显示器」按钮（仅 Windows 显示）。
3. 首次使用会弹出 UAC 窗口请求安装驱动，点击「是」即可（仅需一次）。
4. 安装完成后系统会出现一块新的虚拟屏幕，刷新后即可选择它作为共享源。
5. 在 Windows「显示设置」中可调整虚拟屏分辨率；点击「移除虚拟显示器」即可关闭虚拟屏（驱动会保留，下次可秒开）。

> **注意**：虚拟显示器功能仅支持 Windows；macOS / Linux 下相关按钮不会显示。

### 构建

与原项目一致，额外要求：驱动资源位于 `resources/usbmmidd/usbmmidd_v2/`，打包时通过 `electron-builder.yml` 的 `extraResources` 自动随应用分发。

```bash
git clone https://github.com/chenfang34120/deskreen.git
cd deskreen
npm i
cd ./src/client-viewer && npm i && cd ../..
npm run clean && npm run build
# 打包免安装目录（含驱动资源）
npx electron-builder --win --dir -c.win.signAndEditExecutable=false
```

---



![Deskreen Logo](https://raw.githubusercontent.com/pavlobu/deskreen/master/resources/icon.png)

## Deskreen turns any device with a web browser into a secondary screen for your computer

## To learn more visit our website: [deskreen.com](https://deskreen.com)

## [Donate to support Deskreen Open-Source](https://deskreen.com/#contribute)

Deskreen is an `electron.js` based application that uses `WebRTC` to make a live stream of your computer screen to a web browser on any device. It is available for MacOS, Windows and Linux operating systems.
The current open-source Community Edition version has limited features. If you need more features please consider upgrading to [Pro](https://deskreen.com/download) version for more features when it is released.

---

### ▶️ [See how people use Deskreen on Youtube](https://www.youtube.com/results?search_query=deskreen) (video tutorials, demos, use cases for Deskreen day to day usage)

---

## [Deskreen Frequently Asked Questions](https://deskreen.com/faq)

---

### Prerequisites

You will need to have `node>=v23` `npm>=10` installed.


1. git clone this repo
2. `npm i`
3. `cd ./src/client-viewer && npm i && cd ../..`
4. `npm run clean && npm run build && npm run start` -- run in prod like mode

#### for more npm scripts look at `package.json`

## Starting with Custom Local IP

You can start Deskreen CE with a custom local IP address using the `--local-ip` or `--ip` CLI flag. This is useful when you want to specify a particular network interface IP address.

### macOS

```bash
# Using open command (recommended)
open -a "Deskreen CE" --args --ip 192.168.1.100

# Or using the executable directly
/Applications/Deskreen\ CE.app/Contents/MacOS/Deskreen\ CE --ip 192.168.1.100

# Get your IP automatically and launch
open -a "Deskreen CE" --args --ip "192.168.1.100"
```

### Windows

```powershell
# Using Start-Process (PowerShell)
Start-Process "Deskreen CE" -ArgumentList "--ip", "192.168.1.100"

# Or using the executable directly
"C:\Program Files\Deskreen CE\Deskreen CE.exe" --ip 192.168.1.100

# Or from Command Prompt
start "" "C:\Program Files\Deskreen CE\Deskreen CE.exe" --ip 192.168.1.100
```

### Linux

```bash
# If installed via AppImage
./Deskreen\ CE-*.AppImage --ip 192.168.1.100

# If installed via .deb/.rpm package (usually in /usr/bin or /opt)
deskreen-ce --ip 192.168.1.100

# Or using full path
/opt/Deskreen\ CE/deskreen-ce --ip 192.168.1.100
```

**Note:** Replace `192.168.1.100` with your actual local IP address. You can find your IP using:
- **macOS/Linux:** `ipconfig getifaddr en0` or `ifconfig | grep "inet "`
- **Windows:** `ipconfig` (look for IPv4 Address)

When using the `--ip` or `--local-ip` flag, the app will use the specified IP for QR codes and connection URLs, while still monitoring the actual network interface status for WiFi connection detection.

## Maintainer

- [Pavlo (Paul) Buidenkov](https://www.linkedin.com/in/pavlobu)

## License

AGPL-3.0 License © [Pavlo (Paul) Buidenkov](https://github.com/pavlobu/deskreen)

## Copyright

Electron-Vite MIT License © [electron-vite](https://github.com/alex8088/electron-vite)

React MIT License © [Facebook, Inc. and its affiliates](https://github.com/facebook/react)

Vite MIT License © [Vite.js](https://github.com/vitejs/vite)

Electron Builder MIT License © [electron-builder contributors](https://github.com/electron-userland/electron-builder)

Apache 2.0 © [blueprintjs](https://github.com/palantir/blueprint)

simple-peer MIT. Copyright © [Feross Aboukhadijeh](http://feross.org/)

tweetnacl ISC License © Dmitry Chestnykh, Devi Mandiri, and contributors (https://github.com/dchest/tweetnacl-js)

darkwire.io MIT License © [darkwire/darkwire.io](https://github.com/darkwire/darkwire.io)

And many many others...

## Thanks

🙏 Many thanks to all 🌍 open source community members and maintainers of libraries used in this project.
