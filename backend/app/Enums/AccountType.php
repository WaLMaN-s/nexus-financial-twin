<?php

namespace App\Enums;

enum AccountType: string
{
    case Cash = 'cash';
    case Savings = 'savings';
    case Investment = 'investment';
    case Loan = 'loan';
    case CreditCard = 'credit_card';
}
