# @version ^0.3.3
# vim: ft=python

# ERC721-like Non-Fungible Token Contract in Vyper with Default Constructor Values

# Constants
EMPTY_ADDRESS: constant(address) = 0x0000000000000000000000000000000000000000

# Events
event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    tokenId: indexed(uint256)

event Approval:
    owner: indexed(address)
    approved: indexed(address)
    tokenId: indexed(uint256)

# Storage
owners: public(HashMap[uint256, address])
tokenApprovals: public(HashMap[uint256, address])
ownedTokensCount: public(HashMap[address, uint256])

name: public(String[64])
symbol: public(String[32])
baseTokenURI: public(String[128])
owner: public(address)  # New owner variable

# Initialization with default values
@external
@payable
def __init__(name: String[64], symbol: String[32], baseTokenURI: String[128]):
    self.name = name
    self.symbol = symbol
    self.baseTokenURI = baseTokenURI
    self.owner = msg.sender  # Set the contract deployer as the owner

# Internal function to transfer ownership of a token
@internal
def _transfer(_from: address, _to: address, _tokenId: uint256):
    assert self.owners[_tokenId] == _from, "Token not owned by sender"

    self.ownedTokensCount[_from] -= 1
    self.ownedTokensCount[_to] += 1
    self.owners[_tokenId] = _to

    log Transfer(_from, _to, _tokenId)

# Transfer token to another address
@external
def transfer(_to: address, _tokenId: uint256):
    self._transfer(msg.sender, _to, _tokenId)

# Approve another address to transfer a token
@external
def approve(_approved: address, _tokenId: uint256):
    assert self.owners[_tokenId] == msg.sender, "Not token owner"
    self.tokenApprovals[_tokenId] = _approved

    log Approval(msg.sender, _approved, _tokenId)

# Transfer token from one address to another
@external
def transferFrom(_from: address, _to: address, _tokenId: uint256):
    assert self.tokenApprovals[_tokenId] == msg.sender or self.owners[_tokenId] == msg.sender, "Not authorized"
    self._transfer(_from, _to, _tokenId)

# Get owner of a token
@external
@view
def ownerOf(_tokenId: uint256) -> address:
    return self.owners[_tokenId]

# Get balance of an address
@external
@view
def balanceOf(_owner: address) -> uint256:
    return self.ownedTokensCount[_owner]

# Get approved address for a token
@external
@view
def getApproved(_tokenId: uint256) -> address:
    return self.tokenApprovals[_tokenId]

# New mint function
@external
def mint(_to: address, _tokenId: uint256):
    assert msg.sender == self.owner, "Only the owner can mint"
    assert self.owners[_tokenId] == EMPTY_ADDRESS, "Token ID already exists"
    self.owners[_tokenId] = _to
    self.ownedTokensCount[_to] += 1
    log Transfer(EMPTY_ADDRESS, _to, _tokenId)
                                                   
@view                                    
@external                                                                                      
def tokenURI(tokenId: String[128]) -> String[260]:                                                       
    return concat(self.baseTokenURI, tokenId)
