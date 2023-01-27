"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = __importDefault(require("../src"));
const text = new src_1.default("1");
describe("Reading numbers from 1 - 999", () => {
    it("should read 1", () => {
        chai_1.assert.equal("واحد", text.read(1));
    });
    it("should read 2", () => {
        chai_1.assert.equal("ٱثنين", text.read(2));
    });
    it("should read 10", () => {
        chai_1.assert.equal("عشرة", text.read(10));
    });
    it("should read 11", () => {
        chai_1.assert.equal("أحد عشر", text.read(11));
    });
    it("should read 12", () => {
        chai_1.assert.equal("أثني عشر", text.read(12));
    });
    it("should read 20", () => {
        chai_1.assert.equal("عشرون", text.read(20));
    });
    it("should read 21", () => {
        chai_1.assert.equal("واحد وعشرون", text.read(21));
    });
    it("should read 99", () => {
        chai_1.assert.equal("تسعة وتسعون", text.read(99));
    });
    it("should read 100", () => {
        chai_1.assert.equal("مائة", text.read(100));
    });
    it("should read 120", () => {
        chai_1.assert.equal("مائة وعشرون", text.read(120));
    });
    it("should read 191", () => {
        chai_1.assert.equal("مائة وواحد وتسعون", text.read(191));
    });
    it("should read 989", () => {
        chai_1.assert.equal("تسعمائة وتسعة وثمانون", text.read(989));
    });
});
describe("Reading full amounts without a currecy specified", () => {
    it("should read 7,564,654", () => {
        chai_1.assert.equal("سبعة ملايين وخمسمائة وأربعة وستون ألف وستمائة وأربعة وخمسون فقط لا غير", new src_1.default("7564654", "").parse());
    });
    it("should read 12", () => {
        chai_1.assert.equal("أثني عشر فقط لا غير", new src_1.default("12", "").parse());
    });
    it("should read 74", () => {
        chai_1.assert.equal("أربعة وسبعون فقط لا غير", new src_1.default("74", "").parse());
    });
    it("should read 234", () => {
        chai_1.assert.equal("مائتين وأربعة وثلاثون فقط لا غير", new src_1.default("234", "").parse());
    });
});
describe("Reading full amounts", () => {
    it("should read SDG 1", () => {
        chai_1.assert.equal("واحد جنيه مصري فقط لا غير", new src_1.default("1").parse());
    });
    it("should read SDG 1.20", () => {
        chai_1.assert.equal("واحد جنيه مصري وعشرون قرش فقط لا غير", new src_1.default("1.20").parse());
    });
    it("should read TND 1.200", () => {
        chai_1.assert.equal("واحد دينار تونسي ومائتين مليم فقط لا غير", new src_1.default("1.200", "TND").parse());
    });
    it("should read SDG 1.20 even if there are three decimal places", () => {
        chai_1.assert.equal("واحد جنيه سوداني وعشرون قرش فقط لا غير", new src_1.default("1.200", "SDG").parse());
    });
    it("should read SDG 1,000", () => {
        chai_1.assert.equal("ألف جنيه مصري فقط لا غير", new src_1.default("1000").parse());
    });
    it("should read SDG 1,345", () => {
        chai_1.assert.equal("ألف وثلاثمائة وخمسة وأربعون جنيه مصري فقط لا غير", new src_1.default("1345").parse());
    });
    it("should read SDG 2,455", () => {
        chai_1.assert.equal("ألفين وأربعمائة وخمسة وخمسون جنيه مصري فقط لا غير", new src_1.default("2455").parse());
    });
    it("should read SDG 10,000", () => {
        chai_1.assert.equal("عشرة ألف جنيه مصري فقط لا غير", new src_1.default("10000").parse());
    });
    it("should read SDG 12,444", () => {
        chai_1.assert.equal("أثني عشر ألف وأربعمائة وأربعة وأربعون جنيه مصري فقط لا غير", new src_1.default("12444").parse());
    });
    it("should read SDG 100,000", () => {
        chai_1.assert.equal("مائة ألف جنيه مصري فقط لا غير", new src_1.default("100000").parse());
    });
    it("should read SDG 101,000", () => {
        chai_1.assert.equal("مائة وواحد ألف جنيه مصري فقط لا غير", new src_1.default("101000").parse());
    });
    it("should read SDG 102,000", () => {
        chai_1.assert.equal("مائة وٱثنين ألف جنيه مصري فقط لا غير", new src_1.default("102000").parse());
    });
    it("should read SDG 1,000,000.66", () => {
        chai_1.assert.equal("مليون جنيه مصري وستة وستون قرش فقط لا غير", new src_1.default("1000000.66").parse());
    });
    it("should read TND 1,000,000.660", () => {
        chai_1.assert.equal("مليون دينار تونسي وستمائة وستون مليم فقط لا غير", new src_1.default("1000000.660", "TND").parse());
    });
    it("should read SDG 100,000", () => {
        chai_1.assert.equal("مائة ألف جنيه مصري فقط لا غير", new src_1.default("100000").parse());
    });
    it("should read SDG 1,000,001,000", () => {
        chai_1.assert.equal("مليار وألف جنيه مصري فقط لا غير", new src_1.default("1000001000").parse());
    });
    it("should read SDG 10,010,001,000", () => {
        chai_1.assert.equal("عشرة مليار وعشرة مليون وألف جنيه مصري فقط لا غير", new src_1.default("10010001000").parse());
    });
    it("should read SDG 1,001,000,001,000", () => {
        chai_1.assert.equal("ترليون ومليار وألف جنيه مصري فقط لا غير", new src_1.default("1001000001000").parse());
    });
    it("should read SDG 1,000,000,000,001", () => {
        chai_1.assert.equal("ترليون وواحد جنيه مصري فقط لا غير", new src_1.default("1000000000001").parse());
    });
    it("should read SDG 1,000,100,000,001", () => {
        chai_1.assert.equal("ترليون ومائة مليون وواحد جنيه مصري فقط لا غير", new src_1.default("1000100000001").parse());
    });
    it("should read SDG 10,000,000", () => {
        chai_1.assert.equal("عشرة مليون جنيه مصري فقط لا غير", new src_1.default("10000000").parse());
    });
    it("should read SDG 10,000,001", () => {
        chai_1.assert.equal("عشرة مليون وواحد جنيه مصري فقط لا غير", new src_1.default("10000001").parse());
    });
    it("should read TND 1,001", () => {
        chai_1.assert.equal("ألف وواحد دينار تونسي فقط لا غير", new src_1.default("1001", "TND").parse());
    });
    it("should read TND 556,563.999", () => {
        chai_1.assert.equal("خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون دينار تونسي وتسعمائة وتسعة وتسعون مليم فقط لا غير", new src_1.default("556563.999", "TND").parse());
    });
    it("should read SDG 10,001", () => {
        chai_1.assert.equal("عشرة ألف وواحد جنيه مصري فقط لا غير", new src_1.default("10001").parse());
    });
    it("should read SDG 556,563.20", () => {
        chai_1.assert.equal("خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون جنيه مصري وعشرون قرش فقط لا غير", new src_1.default("556563.20").parse());
    });
    it("should read SDG 100,100", () => {
        chai_1.assert.equal("مائة ألف ومائة جنيه مصري فقط لا غير", new src_1.default("100100").parse());
    });
    it("should read SDG 55,000,051,000", () => {
        chai_1.assert.equal("خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري فقط لا غير", new src_1.default("55000051000").parse());
    });
    it("should read SDG 55,000,051,000.2", () => {
        chai_1.assert.equal("خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وٱثنين قرش فقط لا غير", new src_1.default("55000051000.2").parse());
    });
    it("should read SDG 55,000,051,000.1", () => {
        chai_1.assert.equal("خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وواحد قرش فقط لا غير", new src_1.default("55000051000.1").parse());
    });
});
