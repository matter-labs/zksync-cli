# @version ^0.3.3
# vim: ft=python

greeting: public(String[100]) 

@external 
def __init__(): 
    self.greeting = "Hello World!" 

@external 
@view
def greet() -> String[100]: 
    return self.greeting

@external 
def set_greeting( _greet: String[100]): 
    self.greeting = _greet 
