import shortID from 'shortid';

export default class RoomIDService {
	takenRoomIDs: Set<string>;

	nextSimpleRoomID: number;

	constructor() {
		this.takenRoomIDs = new Set<string>();
		this.nextSimpleRoomID = 1;
		// TODO: load saved taken room ids from local storage, will be useful for saved devices feature in FUTURE
	}

	getSimpleAvailableRoomID(): Promise<string> {
		// 固定房间号，保证连接地址（http://IP:端口/房间号）不随设备断开而改变
		return Promise.resolve('deskreen');
	}

	getShortIDStringOfAvailableRoom(): Promise<string> {
		return new Promise<string>((resolve) => {
			let newID = shortID();
			while (this.takenRoomIDs.has(newID)) {
				newID = shortID();
			}
			resolve(newID);
		});
	}

	markRoomIDAsTaken(id: string): void {
		this.takenRoomIDs.add(id);
	}

	unmarkRoomIDAsTaken(id: string): void {
		this.takenRoomIDs.delete(id);
	}

	isRoomIDTaken(id: string): boolean {
		return this.takenRoomIDs.has(id);
	}
}
