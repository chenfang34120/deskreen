import os from 'os';

export default function isWifiConnected(): boolean {
	const networkInterfaces = os.networkInterfaces();
	let hasValidInterface = false;
	Object.entries(networkInterfaces).some(([networksKey, networks]) => {
		if (!networks) return false;
		if (networksKey.startsWith('bridge')) return false;

		return networks.some((network) => {
			if (network.internal || network.family !== 'IPv4') return false;
			if (
				network.address.startsWith('169.254.') ||
				network.address.startsWith('127.')
			) {
				return false;
			}
			hasValidInterface = true;
			return true;
		});
	});

	return hasValidInterface;
}
