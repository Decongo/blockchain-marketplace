pragma solidity ^0.5.0;   // declare the version of solidity

// handles business logic for buying and selling on blockchain
// this is the backend for the app
contract Marketplace {
  string public name;                            // state variable. stored on the blockchain
  mapping(uint => Product) public products;      // define a key:value pair
  uint public productCount = 0;                  // keeps track of how many items are in the mapping

  struct Product {
    uint id;                                     // unsigned integer
    string name;
    uint price;
    address payable owner;
    bool purchased;
  }

  event ProductCreated (
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
  );

  event ProductPurchased (
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
  );

  // run whenever the contract is deployed
  constructor() public {
    name = 'Dapp University Marketplace';
  }

  // price is stored in Ether Wei. Smart contracts deal in Wei
  function createProduct(string memory _name, uint _price) public {
    // require a name
    require(bytes(_name).length > 0, "product must have a name");      // throws error if condition fails
    // require a valid price
    require(_price > 0, "price must be greater than 0");

    // increment product count
    productCount++;
    // Create the product
    // msg.sender is the caller of this function
    products[productCount] = Product(productCount, _name, _price, msg.sender, false);

    // Trigger an event (tell the BC that something happened)
    emit ProductCreated(productCount, _name, _price, msg.sender, false);
  }

  // payable keyword allows Ether to be sent in
  function purchaseProduct(uint _id) public payable {
    // Fetch product
    Product memory _product = products[_id];
    // Fetch owner
    address payable _seller = _product.owner;
    // validate product
    require(_product.id > 0 && _product.id <= productCount, "product id must be greater than 0 not greater than the product count");
    require(msg.value >= _product.price, "value must not be less than product price");
    require(!_product.purchased, "product must be purchased");
    require(_seller != msg.sender, "buyer and seller must not be the same account");
    // transfer ownership to the buyer
    _product.owner = msg.sender;
    // purchase
    _product.purchased = true;
    // update product in mapping
    products[_id] = _product;
    // pay the seller by sending them Ether
    address(_seller).transfer(msg.value);
    // trigger an event
    emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
  }
}