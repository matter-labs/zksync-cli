# @version ^0.3.3
# vim: ft=python

# ERC721-like Non-Fungible Token Contract in Vyper with Default Constructor Values

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
owners: public(map(uint256, address))
tokenApprovals: public(map(uint256, address))
ownedTokensCount: public(map(address, uint256))

name: public(String[64])
symbol: public(String[32])
baseTokenURI: public(String[128])

# Initialization with default values
@public
@payable
def __init__():
    self.name = "DefaultNFTName"
    self.symbol = "DNFT"
    self.baseTokenURI = "https://mybaseuri.com/token/"

# Internal function to transfer ownership of a token
@private
def _transfer(_from: address, _to: address, _tokenId: uint256):
    assert self.owners[_tokenId] == _from, "Token not owned by sender"

    self.ownedTokensCount[_from] -= 1
    self.ownedTokensCount[_to] += 1
    self.owners[_tokenId] = _to

    log.Transfer(_from, _to, _tokenId)

# Transfer token to another address
@public
def transfer(_to: address, _tokenId: uint256):
    _transfer(msg.sender, _to, _tokenId)

# Approve another address to transfer a token
@public
def approve(_approved: address, _tokenId: uint256):
    assert self.owners[_tokenId] == msg.sender, "Not token owner"
    self.tokenApprovals[_tokenId] = _approved

    log.Approval(msg.sender, _approved, _tokenId)

# Transfer token from one address to another
@public
def transferFrom(_from: address, _to: address, _tokenId: uint256):
    assert self.tokenApprovals[_tokenId] == msg.sender or self.owners[_tokenId] == msg.sender, "Not authorized"
    _transfer(_from, _to, _tokenId)

# Get owner of a token
@public
@view
def ownerOf(_tokenId: uint256) -> address:
    return self.owners[_tokenId]

# Get approved address for a token
@public
@view
def getApproved(_tokenId: uint256) -> address:
    return self.tokenApprovals[_tokenId]

# Get token URI
@public
@view
def tokenURI(_tokenId: uint256) -> string:
    return concat(self.baseTokenURI, _tokenId)
