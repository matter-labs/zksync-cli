# @version ^0.3.3
# vim: ft=python

# ERC20-like Fungible Token Contract in Vyper

# Events
event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    value: uint256

event Approval:
    owner: indexed(address)
    spender: indexed(address)
    value: uint256

# Storage
balances: public(HashMap[address, uint256])
allowances: public(HashMap[address, HashMap[address, uint256]])
total_supply: public(uint256)

name: public(String[64])
symbol: public(String[32])
decimals: public(uint256)

# Initialization
@payable
@external
def __init__(_name: String[64], _symbol: String[32], _initialSupply: uint256):
    self.name = _name
    self.symbol = _symbol
    self.decimals = 18  # Standard for ERC20
    self.total_supply = _initialSupply * (10 ** self.decimals)
    self.balances[msg.sender] = self.total_supply

# Transfer tokens
@external
def transfer(_to: address, _value: uint256) -> bool:
    assert self.balances[msg.sender] >= _value, "Insufficient balance"
    self.balances[msg.sender] -= _value
    self.balances[_to] += _value

    log Transfer(msg.sender, _to, _value)
    return True

# Approve an allowance for a spender
@external
def approve(_spender: address, _value: uint256) -> bool:
    self.allowances[msg.sender][_spender] = _value

    log Approval(msg.sender, _spender, _value)
    return True

# Transfer tokens from a given address to another address
@external
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    assert _value <= self.balances[_from], "Insufficient balance"
    assert _value <= self.allowances[_from][msg.sender], "Allowance too low"

    self.balances[_from] -= _value
    self.balances[_to] += _value
    self.allowances[_from][msg.sender] -= _value

    log Transfer(_from, _to, _value)
    return True

# Get balance of an address
@external
def balanceOf(_owner: address) -> uint256:
    return self.balances[_owner]

# Get allowance approved for a spender
@external
def allowance(_owner: address, _spender: address) -> uint256:
    return self.allowances[_owner][_spender]

# Burn tokens
@external
def burn(_value: uint256) -> bool:
    assert self.balances[msg.sender] >= _value, "Burn amount exceeds balance"
    self.balances[msg.sender] -= _value
    self.total_supply -= _value
    log Transfer(msg.sender, 0x0000000000000000000000000000000000000000, _value)  # Emitting a transfer to the zero address is a common way to indicate tokens were burned
    return True
