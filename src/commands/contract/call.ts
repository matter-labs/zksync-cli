import inquirer from "inquirer";

import Program from "./command.js";
import { DefaultOptions, accountOption, chainOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import { getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";

type CallOptions = DefaultOptions & {
    chain?: string;
    address?: string;
    function?: string;
    data?: string;
  };
  