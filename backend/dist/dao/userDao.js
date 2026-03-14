"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserDao {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
            const newUser = new userModel_1.default(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
            const savedUser = yield newUser.save();
            const { _id, email, username, image } = savedUser;
            return {
                id: _id.toString(),
                email,
                username,
                image,
            };
        });
    }
    getUserById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundUser = yield userModel_1.default.findOne({ _id })
                .select("-password -tokens -_id -__v")
                .lean();
            if (!foundUser)
                return foundUser;
            return Object.assign(Object.assign({}, foundUser), { id: _id });
        });
    }
    updateUserById(_id, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield userModel_1.default.findOneAndUpdate({ _id }, updatedData, {
                new: true,
            });
            if (!updatedUser)
                return null;
            const _a = updatedUser.toObject(), { password, tokens, _id: __id, __v } = _a, userWithoutProps = __rest(_a, ["password", "tokens", "_id", "__v"]);
            return Object.assign(Object.assign({}, userWithoutProps), { id: _id });
        });
    }
}
exports.default = new UserDao();
