import { app } from 'electron';
import { spawn, execFile } from 'child_process';
import * as path from 'path';

/**
 * 基于 Amyuni usbmmidd_v2 虚拟显示驱动的虚拟显示器服务（仅 Windows）。
 * 驱动随应用打包在 extraResources 的 usbmmidd_v2 目录下。
 */
class VirtualDisplayService {
	private static readonly DRIVER_FRIENDLY_NAME =
		'USB Mobile Monitor Virtual Display';

	private static readonly MAX_VIRTUAL_DISPLAYS = 4;

	private getDriverDir(): string {
		if (app.isPackaged) {
			return path.join(process.resourcesPath, 'usbmmidd_v2');
		}
		return path.join(
			app.getAppPath(),
			'resources',
			'usbmmidd',
			'usbmmidd_v2',
		);
	}

	private getToolPath(): string {
		return path.join(this.getDriverDir(), 'deviceinstaller64.exe');
	}

	isSupported(): boolean {
		return process.platform === 'win32';
	}

	private runTool(args: string[]): Promise<{ code: number; output: string }> {
		return new Promise((resolve) => {
			const proc = spawn(this.getToolPath(), args, {
				cwd: this.getDriverDir(),
				windowsHide: true,
			});
			let output = '';
			proc.stdout.on('data', (d) => {
				output += d.toString();
			});
			proc.stderr.on('data', (d) => {
				output += d.toString();
			});
			proc.on('error', (err) => {
				output += String(err);
				resolve({ code: -1, output });
			});
			proc.on('close', (code) => {
				resolve({ code: code ?? -1, output });
			});
		});
	}

	/**
	 * 通过 PowerShell 以管理员权限运行工具（UAC 弹窗），返回退出码。
	 */
	private async runToolElevated(
		args: string[],
	): Promise<number> {
		const argList = args.map((a) => `'${a}'`).join(',');
		const script = [
			`$p = Start-Process -FilePath '${this.getToolPath().replace(/'/g, "''")}'`,
			`-ArgumentList ${argList}`,
			`-WorkingDirectory '${this.getDriverDir().replace(/'/g, "''")}'`,
			'-Verb RunAs -PassThru -Wait',
			'$p.WaitForExit()',
			'exit $p.ExitCode',
		].join(' ');
		return new Promise((resolve) => {
			execFile(
				'powershell.exe',
				['-NoProfile', '-NonInteractive', '-Command', script],
				{ windowsHide: true, timeout: 120000 },
				(err) => {
					// err 非空：工具退出码非 0、用户取消 UAC 或 PowerShell 报错
					resolve(err ? -1 : 0);
				},
			);
		});
	}

	private runPowerShell(script: string, timeout = 30000): Promise<string> {
		return new Promise((resolve) => {
			execFile(
				'powershell.exe',
				['-NoProfile', '-NonInteractive', '-Command', script],
				{ windowsHide: true, timeout },
				(_err, stdout) => {
					resolve((stdout ?? '').trim());
				},
			);
		});
	}

	private async pnpDeviceCount(status?: string): Promise<number> {
		const statusFilter = status ? ` -Status ${status}` : '';
		const out = await this.runPowerShell(
			`(Get-PnpDevice -FriendlyName '*${VirtualDisplayService.DRIVER_FRIENDLY_NAME}'${statusFilter} -ErrorAction SilentlyContinue | Measure-Object).Count`,
		);
		const n = Number.parseInt(out, 10);
		return Number.isNaN(n) ? 0 : n;
	}

	/**
	 * 检测驱动是否已安装（非管理员可用）。
	 */
	async isDriverInstalled(): Promise<boolean> {
		if (!this.isSupported()) return false;
		return (await this.pnpDeviceCount()) > 0;
	}

	private async countActiveVirtualDisplays(): Promise<number> {
		return this.pnpDeviceCount('OK');
	}

	async getStatus(): Promise<{
		supported: boolean;
		driverInstalled: boolean;
		activeCount: number;
	}> {
		if (!this.isSupported()) {
			return { supported: false, driverInstalled: false, activeCount: 0 };
		}
		const [driverInstalled, activeCount] = await Promise.all([
			this.isDriverInstalled(),
			this.countActiveVirtualDisplays(),
		]);
		return { supported: true, driverInstalled, activeCount };
	}

	/**
	 * 添加一个虚拟显示器（驱动未安装时先以管理员安装，然后启用）。
	 */
	async addVirtualDisplay(): Promise<void> {
		if (!this.isSupported()) {
			throw new Error('virtual display only supported on windows');
		}
		const installed = await this.isDriverInstalled();
		if (!installed) {
			const installCode = await this.runToolElevated([
				'install',
				'usbmmidd.inf',
				'usbmmidd',
			]);
			if (installCode !== 0) {
				throw new Error(
					`failed to install virtual display driver (exit ${installCode})`,
				);
			}
		}

		const status = await this.getStatus();
		if (status.activeCount >= VirtualDisplayService.MAX_VIRTUAL_DISPLAYS) {
			throw new Error('maximum virtual displays reached');
		}

		// enableidd 优先非提权执行，失败（权限不足等）再走 UAC 提权
		let { code } = await this.runTool(['enableidd', '1']);
		if (code !== 0) {
			code = await this.runToolElevated(['enableidd', '1']);
		}
		if (code !== 0) {
			throw new Error(`failed to enable virtual display (exit ${code})`);
		}
	}

	/**
	 * 移除一个虚拟显示器（保留驱动，便于下次免提权添加）。
	 */
	async removeVirtualDisplay(): Promise<void> {
		if (!this.isSupported()) {
			throw new Error('virtual display only supported on windows');
		}
		const status = await this.getStatus();
		if (status.activeCount <= 0) {
			return;
		}
		let { code } = await this.runTool(['enableidd', '0']);
		if (code !== 0) {
			code = await this.runToolElevated(['enableidd', '0']);
		}
		if (code !== 0) {
			throw new Error(`failed to disable virtual display (exit ${code})`);
		}
	}
}

const virtualDisplayService = new VirtualDisplayService();
export default virtualDisplayService;
