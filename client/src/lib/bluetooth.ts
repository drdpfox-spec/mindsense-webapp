/**
 * Web Bluetooth API integration for FibroSense monitoring patches
 * 
 * This module provides real Bluetooth Low Energy (BLE) device connectivity
 * for continuous biomarker monitoring from FibroSense patches.
 */

// FibroSense BLE Service UUID (custom UUID for FibroSense devices)
const FIBROSENSE_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';

// Characteristic UUIDs for different data types
const BIOMARKER_DATA_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const BATTERY_LEVEL_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const DEVICE_STATUS_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';

export interface BiomarkerReading {
  piiinp: number | null;  // ng/mL * 10 (stored as integer)
  ha: number | null;      // ng/mL
  timp1: number | null;   // ng/mL
  tgfb1: number | null;   // pg/mL * 10 (stored as integer)
  timestamp: Date;
}

export interface DeviceStatus {
  connected: boolean;
  batteryLevel: number;
  lastSync: Date | null;
  deviceName: string | null;
  firmwareVersion: string | null;
}

export class FibroSenseBluetoothManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private biomarkerCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private statusCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataCallback: ((reading: BiomarkerReading) => void) | null = null;
  private onStatusCallback: ((status: DeviceStatus) => void) | null = null;

  /**
   * Check if Web Bluetooth API is supported in the current browser
   */
  static isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Request user to select and pair with a FibroSense device
   */
  async requestDevice(): Promise<void> {
    if (!FibroSenseBluetoothManager.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    try {
      // Request device with FibroSense service filter
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [FIBROSENSE_SERVICE_UUID] },
          { namePrefix: 'FibroSense' }
        ],
        optionalServices: [FIBROSENSE_SERVICE_UUID]
      });

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnection();
      });

      console.log('Device selected:', this.device.name);
    } catch (error) {
      console.error('Device selection failed:', error);
      throw new Error('Failed to select device. Please try again.');
    }
  }

  /**
   * Connect to the selected FibroSense device
   */
  async connect(): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected. Call requestDevice() first.');
    }

    try {
      console.log('Connecting to GATT Server...');
      this.server = await this.device.gatt?.connect() || null;

      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      console.log('Getting FibroSense service...');
      const service = await this.server.getPrimaryService(FIBROSENSE_SERVICE_UUID);

      // Get characteristics
      console.log('Getting characteristics...');
      this.biomarkerCharacteristic = await service.getCharacteristic(BIOMARKER_DATA_CHAR_UUID);
      this.batteryCharacteristic = await service.getCharacteristic(BATTERY_LEVEL_CHAR_UUID);
      this.statusCharacteristic = await service.getCharacteristic(DEVICE_STATUS_CHAR_UUID);

      // Start notifications for biomarker data
      await this.biomarkerCharacteristic.startNotifications();
      this.biomarkerCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        this.handleBiomarkerData(event);
      });

      // Start notifications for battery level
      await this.batteryCharacteristic.startNotifications();
      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        this.handleBatteryUpdate(event);
      });

      console.log('Connected successfully!');
      this.notifyStatusChange();
    } catch (error) {
      console.error('Connection failed:', error);
      throw new Error('Failed to connect to device. Please ensure the device is powered on and in range.');
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.device = null;
    this.server = null;
    this.biomarkerCharacteristic = null;
    this.batteryCharacteristic = null;
    this.statusCharacteristic = null;
    this.notifyStatusChange();
  }

  /**
   * Get current device status
   */
  getStatus(): DeviceStatus {
    return {
      connected: this.server?.connected || false,
      batteryLevel: 0, // Will be updated via notifications
      lastSync: null,
      deviceName: this.device?.name || null,
      firmwareVersion: null,
    };
  }

  /**
   * Register callback for biomarker data updates
   */
  onData(callback: (reading: BiomarkerReading) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Register callback for device status updates
   */
  onStatusChange(callback: (status: DeviceStatus) => void): void {
    this.onStatusCallback = callback;
  }

  /**
   * Handle incoming biomarker data from the device
   */
  private handleBiomarkerData(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;

    if (!value) return;

    // Parse biomarker data from DataView
    // Format: 4 bytes per biomarker (int16) + 8 bytes timestamp (int64)
    const piiinp = value.byteLength >= 2 ? value.getInt16(0, true) : null;
    const ha = value.byteLength >= 4 ? value.getInt16(2, true) : null;
    const timp1 = value.byteLength >= 6 ? value.getInt16(4, true) : null;
    const tgfb1 = value.byteLength >= 8 ? value.getInt16(6, true) : null;

    const reading: BiomarkerReading = {
      piiinp: piiinp !== null && piiinp !== -1 ? piiinp : null,
      ha: ha !== null && ha !== -1 ? ha : null,
      timp1: timp1 !== null && timp1 !== -1 ? timp1 : null,
      tgfb1: tgfb1 !== null && tgfb1 !== -1 ? tgfb1 : null,
      timestamp: new Date(),
    };

    console.log('Biomarker reading received:', reading);

    if (this.onDataCallback) {
      this.onDataCallback(reading);
    }
  }

  /**
   * Handle battery level updates
   */
  private handleBatteryUpdate(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;

    if (!value) return;

    const batteryLevel = value.getUint8(0);
    console.log('Battery level:', batteryLevel + '%');

    this.notifyStatusChange();
  }

  /**
   * Handle device disconnection
   */
  private handleDisconnection(): void {
    console.log('Device disconnected');
    this.server = null;
    this.biomarkerCharacteristic = null;
    this.batteryCharacteristic = null;
    this.statusCharacteristic = null;
    this.notifyStatusChange();
  }

  /**
   * Notify status change callback
   */
  private notifyStatusChange(): void {
    if (this.onStatusCallback) {
      this.onStatusCallback(this.getStatus());
    }
  }
}

// Export singleton instance
export const bluetoothManager = new FibroSenseBluetoothManager();
