jest.mock("@react-native-async-storage/async-storage", () => ({
  removeItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_KEYS,
  clearArecoStorage,
} from "../constants/arecoStorageKeys";

describe("clearArecoStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("removes every progress key", async () => {
    await clearArecoStorage();
    const values = Object.values(STORAGE_KEYS);
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(values.length);
    for (const k of values) {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(k);
    }
  });
});
