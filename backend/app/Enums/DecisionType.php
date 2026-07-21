<?php

namespace App\Enums;

enum DecisionType: string
{
    case BuyVehicle = 'buy_vehicle';
    case BuyHouse = 'buy_house';
    case BuyGadget = 'buy_gadget';
    case Marriage = 'marriage';
    case Children = 'children';
    case StartBusiness = 'start_business';
    case TakeLoan = 'take_loan';
    case InvestMore = 'invest_more';
}
