import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  // react lifecycle method, runs whenever component mounts
  async componentWillMount() {
    await this.loadweb3();
    await this.loadBlockchainData();
  }

  // connect to BC
  async loadweb3() {
    if (window.ethereum) {
      // create connection to BC
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();        // load metamask accounts
    this.setState({ account: accounts[0] });              // extract first account (seller)
    const networkId = await web3.eth.net.getId();         // get current network ID (Ganache)
    const networkData = Marketplace.networks[networkId];  // get the network
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      this.setState({ marketplace });
      const productCount = await marketplace.methods.productCount().call();
      console.log(productCount.toString());
      this.setState({ loading: false });
    }
    else {
      window.alert("Marketplace contract not deployed to detected network");
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this);
  }

  createProduct(name, price) {
    this.setState({ loading: true });
    // calling smart contract functions requires sending metadata
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
      .once('receipt', receipt => {
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex'>
              {this.state.loading
                ? <div id='loader' className='text-center'><p className='text-center'>Loading...</p></div>
                : <Main createProduct={this.createProduct} />}
            </main>
          </div>
        </div>
        
      </div>
    );
  }
}

export default App;