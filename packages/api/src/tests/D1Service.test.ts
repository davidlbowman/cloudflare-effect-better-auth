import { describe, expect, test } from "bun:test";
import { D1Service } from "../services/D1Service";

describe("D1Service", () => {
	test("should be defined as a Context.Tag", () => {
		expect(D1Service).toBeDefined();
		expect(typeof D1Service).toBe("function");
	});
});
