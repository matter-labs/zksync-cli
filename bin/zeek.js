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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        const api_url = "https://zenquotes.io/api/random/";
        let quote = "";
        try {
            const response = yield axios_1.default.get(api_url);
            var data = response.data;
            quote = data[0]["q"] + " - " + data[0]["a"];
        }
        catch (e) {
            quote = "No inspirational quote for you now.";
        }
        console.log(chalk_1.default.white("\n\n\
  -██--                                                        --▓▓-  \n\
 -█▓---▓▓██▓                                               -▓██▓▓--█▓ \n\
 ▓█--▓▓▓---▓██-                                         ▓██▓---▓▓--██ \n\
 ██-██-▓█▓▓---▓█▓-                                   -▓█▓---▓▓█▓██-▓█-\n\
 █▓▓█-   -██▓---▓██-         ▓▓▓▓▓▓▓▓▓▓▓▓          -██▓---▓██-   █▓-█▓\n\
-█▓██      -██----▓██████▓▓▓▓▓---------▓▓▓▓▓▓██▓▓▓██▓---▓██-     ▓█-██\n\
-█▓█▓        ▓█▓---------------------------------▓-----██-       -█-▓█\n\
-█▓█▓      -▓█▓---------------------------------------▓██-       -█▓▓█\n\
 █▓█▓    ▓██▓--------------------------------------------▓█▓     -█▓██\n\
 █▓██  ▓█▓-------------------------------------------------▓█▓   ▓█-██\n\
 ██▓█-██-----------------------------------------------------▓█- ██-█▓\n\
 -█▓██▓-------------------------------------------------------▓███▓▓█ \n\
  ███▓----------------------------------------------------------██▓█▓ \n\
  ██▓---------▓▓▓▓▓████▓▓▓▓----------------▓▓▓▓▓▓▓▓▓▓▓▓----------███  \n\
  █▓-------▓██▓▓▓▓▓██▓▓▓▓▓██▓▓----------▓██▓▓▓▓▓▓▓▓▓▓▓██▓▓--------█▓  \n\
 ██------▓██▓▓███████▓--▓██▓▓██-------▓██▓▓███████▓-▓██▓▓██▓------▓█  \n\
-█▓-----▓█▓▓███▓▓▓▓▓▓    -███▓▓█▓▓▓▓▓██▓▓███▓▓▓▓▓▓    ███▓▓█▓------█▓ \n\
▓█-----▓█▓▓██▓▓▓▓▓▓▓-    ▓▓ ▓█▓▓██▓▓██▓███▓▓▓▓▓▓▓    ▓▓--█▓▓█▓-----▓█ \n\
██-----██▓██▓▓▓▓▓▓▓▓    ▓▓  ▓█▓▓██▓██▓▓██▓▓▓▓▓▓▓    -▓- -██▓██-----▓█-\n\
██-----██▓██▓▓▓▓▓▓▓    ▓▓- -▓█▓▓█▓-▓█▓▓██▓▓▓▓▓▓-    ▓▓  ▓██▓██------█-\n\
██-----▓█▓▓██▓▓▓▓▓    -▓-  ▓██▓▓█▓--█▓▓██▓▓▓▓▓▓    ▓▓  ▓██▓▓██-----▓█-\n\
██------▓█▓▓███▓▓-    ▓▓  ▓██▓▓█▓---▓█▓▓███▓▓▓    ▓▓  -███▓██▓-----▓█-\n\
▓█-------▓██▓████    ▓█--▓█▓▓██▓-----▓██▓▓███-   -▓▓ -██▓▓██-------██ \n\
 █▓--------▓██▓▓▓███████▓▓▓█▓-         -██▓▓▓██▓▓████▓▓▓██▓--------█▓ \n\
 ▓█   -------▓▓▓████████▓▓-    -█▓▓▓▓-   -▓███▓▓▓████▓▓---------  ▓█  \n\
  ▓█                      ▓▓   --███--    █                      ▓█-  \n\
   ▓█-                     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓-                     ▓█    \n\
    -█▓                                                       -█▓     \n\
      -█▓                                                   -█▓       \n\
        -▓█-                                              ▓█▓         \n\
           -▓█▓-                                      -▓█▓-           \n\
               -▓██▓--                          --▓██▓-               \n\
                    --▓▓█▓▓▓▓▓▓--------▓▓▓▓▓▓█▓▓--                    \n\
"));
        console.log(chalk_1.default.magentaBright(`zeek would like to tell you "${quote}"\n\n`));
    });
}
exports.default = default_1;
