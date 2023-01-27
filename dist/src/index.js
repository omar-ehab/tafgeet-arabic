"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class Tafgeet {
    constructor(digit, currency = 'EGP') {
        this.currency = currency;
        this.splitted = digit.toString().split(".");
        this.digit = parseInt(this.splitted[0], 10);
        this.fraction = 0;
        this.ones = {
            _1: "واحد",
            _2: "ٱثنين",
            _3: "ثلاثة",
            _4: "أربعة",
            _5: "خمسة",
            _6: "ستة",
            _7: "سبعة",
            _8: "ثمانية",
            _9: "تسعة",
        };
        this.teens = {
            _11: "أحد عشر",
            _12: "أثني عشر",
            _13: "ثلاثة عشر",
            _14: "أربعة عشر",
            _15: "خمسة عشر",
            _16: "ستة عشر",
            _17: "سبعة عشر",
            _18: "ثمانية عشر",
            _19: "تسعة عشر",
        };
        this.tens = {
            _10: "عشرة",
            _20: "عشرون",
            _30: "ثلاثون",
            _40: "أربعون",
            _50: "خمسون",
            _60: "ستون",
            _70: "سبعون",
            _80: "ثمانون",
            _90: "تسعون",
        };
        this.hundreds = {
            _100: "مائة",
            _200: "مائتين",
            _300: "ثلاثمائة",
            _400: "أربعمائة",
            _500: "خمسمائة",
            _600: "ستمائة",
            _700: "سبعمائة",
            _800: "ثمانمائة",
            _900: "تسعمائة",
        };
        this.thousands = {
            singular: "ألف",
            binary: "ألفين",
            plural: "ألآف",
        };
        this.millions = {
            singular: "مليون",
            binary: "مليونين",
            plural: "ملايين",
        };
        this.billions = {
            singular: "مليار",
            binary: "مليارين",
            plural: "مليارات",
        };
        this.trillions = {
            singular: "ترليون",
            binary: "ترليونين",
            plural: "ترليونات",
        };
        let fraction;
        if (this.splitted.length > 1) {
            if (this.splitted[1].length > 1) {
                fraction = parseInt(this.splitted[1], 10);
                if (fraction >= 1 && fraction <= 99) {
                    this.fraction = this.splitted[1].length === 1 ? fraction * 10 : fraction;
                }
                else {
                    //trim it
                    let trimmed = this.splitted[1].split('');
                    fraction = "";
                    for (let index = 0; index < constants_1.currencies[currency].decimals; index++) {
                        fraction += trimmed[index];
                    }
                    this.fraction = parseInt(fraction, 10);
                }
            }
            else {
                this.fraction = parseInt(this.splitted[1], 10);
            }
        }
    }
    parse() {
        let serialized = [];
        let tmp = [];
        let inc = 1;
        let count = this.length();
        let columnIdx = this.getColumnIndex();
        if (count >= 16) {
            console.error("Number out of range!");
            return;
        }
        //Sperate the number into columns
        Array.from(this.digit.toString())
            .reverse()
            .forEach(function (d, i) {
            tmp.push(d);
            if (inc == 3) {
                serialized.unshift(tmp);
                tmp = [];
                inc = 0;
            }
            if (inc == 0 && count - (i + 1) < 3 && count - (i + 1) != 0) {
                serialized.unshift(tmp);
            }
            inc++;
        });
        // Generate concatenation array
        let concats = [];
        for (let i = this.getColumnIndex(); i < constants_1.columns.length; i++) {
            concats[i] = " و";
        }
        //We do not need some "و"s check last column if 000 drill down until otherwise
        if (this.digit > 999) {
            if (parseInt(Array.from(serialized[serialized.length - 1]).join("")) == 0) {
                concats[concats.length - 1] = "";
                for (let i = serialized.length - 1; i >= 1; i--) {
                    if (parseInt(Array.from(serialized[i]).join("")) == 0) {
                        concats[i] = "";
                    }
                    else {
                        break;
                    }
                }
            }
        }
        let str = "";
        if (this.length() >= 1 && this.length() <= 3) {
            str += this.read(this.digit);
        }
        else {
            for (let i = 0; i < serialized.length; i++) {
                let joinedNumber = parseInt(serialized[i].reverse().join(""));
                if (joinedNumber == 0) {
                    columnIdx++;
                    continue;
                }
                if (columnIdx == null || columnIdx + 1 > constants_1.columns.length) {
                    str += this.read(joinedNumber);
                }
                else {
                    str += this.addSuffixPrefix(serialized[i], columnIdx) + concats[columnIdx];
                }
                columnIdx++;
            }
        }
        if (this.currency != "") {
            if (this.digit >= 3 && this.digit <= 10) {
                str += " " + constants_1.currencies[this.currency].plural;
            }
            else {
                str += " " + constants_1.currencies[this.currency].singular;
            }
            if (this.fraction != 0) {
                if (this.digit >= 3 && this.digit <= 10) {
                    str +=
                        " و" +
                            this.read(this.fraction) +
                            " " +
                            constants_1.currencies[this.currency].fractions;
                }
                else {
                    str +=
                        " و" +
                            this.read(this.fraction) +
                            " " +
                            constants_1.currencies[this.currency].fraction;
                }
            }
        }
        str += " فقط لا غير";
        return str;
    }
    ;
    read(d) {
        let str = "";
        let len = Array.from(d.toString()).length;
        if (len == 1) {
            str += this.readOnes(d);
        }
        else if (len == 2) {
            str += this.readTens(d);
        }
        else if (len == 3) {
            str += this.readHundreds(d);
        }
        return str;
    }
    ;
    length() {
        return Array.from(this.digit.toString()).length;
    }
    ;
    getColumnIndex() {
        let column = 0;
        if (this.length() > 12) {
            column = 0;
        }
        else if (this.length() <= 12 && this.length() > 9) {
            column = 1;
        }
        else if (this.length() <= 9 && this.length() > 6) {
            column = 2;
        }
        else if (this.length() <= 6 && this.length() >= 4) {
            column = 3;
        }
        return column;
    }
    ;
    readOnes(d) {
        if (d === 0)
            return;
        return this.ones["_" + d.toString()];
    }
    ;
    readTens(d) {
        if (Array.from(d.toString())[1] === "0") {
            return this.tens["_" + d.toString()];
        }
        if (d > 10 && d < 20) {
            return this.teens["_" + d.toString()];
        }
        if (d > 19 && d < 100 && Array.from(d.toString())[1] !== "0") {
            return (this.readOnes(parseInt(Array.from(d.toString())[1], 10)) +
                " و" +
                this.tens["_" + Array.from(d.toString())[0] + "0"]);
        }
    }
    ;
    readHundreds(d) {
        let str = "";
        str += this.hundreds["_" + Array.from(d.toString())[0] + "00"];
        if (Array.from(d.toString())[1] === "0" &&
            Array.from(d.toString())[2] !== "0") {
            str += " و" + this.readOnes(parseInt(Array.from(d.toString())[2], 10));
        }
        if (Array.from(d.toString())[1] !== "0") {
            str +=
                " و" +
                    this.readTens(parseInt((Array.from(d.toString())[1] + Array.from(d.toString())[2]).toString(), 10));
        }
        return str;
    }
    ;
    addSuffixPrefix(arr, columnIdx) {
        const columnConstant = this.getColumnConstantByColumnIdx(columnIdx);
        if (arr.length == 1) {
            if (parseInt(arr[0]) == 1) {
                if (columnConstant)
                    return columnConstant.singular;
            }
            if (parseInt(arr[0]) == 2) {
                if (columnConstant)
                    return columnConstant.binary;
            }
            if (parseInt(arr[0]) > 2 && parseInt(arr[0]) <= 9) {
                if (columnConstant)
                    return (`${this.readOnes(parseInt(arr[0]))} ${columnConstant.plural}`);
            }
        }
        else {
            let joinedNumber = parseInt(arr.join(""));
            if (joinedNumber > 1) {
                if (columnConstant)
                    return (`${this.read(joinedNumber)} ${columnConstant.singular}`);
            }
            else {
                if (columnConstant)
                    return columnConstant.singular;
            }
        }
    }
    ;
    getColumnConstantByColumnIdx(columnIdx) {
        const colName = constants_1.columns[columnIdx];
        switch (colName) {
            case 'trillions':
                return this.trillions;
            case 'billions':
                return this.billions;
            case 'millions':
                return this.millions;
            case 'thousands':
                return this.thousands;
            default:
                return null;
        }
    }
}
exports.default = Tafgeet;
