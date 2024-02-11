import { Tabs, Tab } from "react-bootstrap";
import dBank from "../abis/dBank.json";
import React, { Component } from "react";
import Token from "../abis/Token.json";
import dbank from "../dbank.png";
import { ethers } from "ethers";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: "undefined",
      account: "undefined", // Initialize with an empty string
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      provider: "undefined",
    };
  }

  async componentDidMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const accounts = await signer.getAddress();

        // load balance
        if (accounts) {
          const balance = await signer.getBalance();
          this.setState({
            account: accounts,
            balance: balance.toString(),
            provider: provider,
          });
        } else {
          window.alert("Please login with MetaMask");
        }
        const contractAddress = prompt("Enter Token contract address:");

        // load contracts
        try {
          const networkId = await provider
            .getNetwork()
            .then((network) => network.chainId);

          // Log statements for debugging
          console.log("networkId:", networkId);

          const token = new ethers.Contract(
            Token.networks[networkId].address,
            contractAddress,
            Token.abi,
            signer
          );
          const dbank = new ethers.Contract(
            dBank.networks[networkId].address,
            dBank.abi,
            signer
          );
          const dBankAddress = dBank.networks[networkId].address;
          this.setState({
            token: token,
            dbank: dbank,
            dBankAddress: dBankAddress,
          });
        } catch (e) {
          console.log("Error", e);
          window.alert("Contracts not deployed to the current network");
        }
      } catch (error) {
        console.log("Error enabling Metamask:", error);
        window.alert("Please enable MetaMask");
      }
    } else {
      window.alert("Please install MetaMask");
    }
  }

  async deposit(amount) {
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.deposit({
          value: ethers.utils.parseEther(amount.toString()),
        });
      } catch (e) {
        console.log("Error, deposit: ", e);
      }
    }
  }

  async withdraw(e) {
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.withdraw();
      } catch (e) {
        console.log("Error, withdraw: ", e);
      }
    }
  }

  async borrow(amount) {
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.borrow({
          value: ethers.utils.parseEther(amount.toString()),
        });
      } catch (e) {
        console.log("Error, borrow: ", e);
      }
    }
  }

  async payOff(e) {
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        const collateralEther = await this.state.dbank.collateralEther(
          this.state.account
        );
        const tokenBorrowed = collateralEther.div(2); // Use div for BigNumber
        await this.state.token.approve(this.state.dBankAddress, tokenBorrowed);
        await this.state.dbank.payOff();
      } catch (e) {
        console.log("Error, pay off: ", e);
      }
    }
  }

  calculateBreakevenUnits = async () => {
    if (this.state.provider !== "undefined" && this.state.dbank !== null) {
      try {
        // Add a modal overlay to get user input
        const loanAmount = parseFloat(prompt("Enter Loan Amount"));
        const annualInterestRate = parseFloat(
          prompt("Enter annual interest rate (in percent %):")
        );
        const loanTermYears = parseFloat(prompt("Loan Term (In Years):"));
        const costPerUnit = parseFloat(
          prompt("Cost per unit, (If there income per unit to pay off loan):")
        );
        const costOfSalesPercentage = parseFloat(
          prompt(
            "Cost of sale for sold items. (What it costs to produce items to sell):"
          )
        );

        const breakevenUnits = this.calculateBreakevenUnits(
          loanAmount,
          annualInterestRate,
          loanTermYears,
          costPerUnit,
          costOfSalesPercentage
        );

        // Update state or handle the result as needed
        console.log("Breakeven Units:", breakevenUnits);
      } catch (e) {
        console.log("Error calculating breakeven units:", e);
      }
    }
  };

  // ... other methods and render function ...

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.iamgadetboy.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>d₿ank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to d₿ank</h1>
          <h2 className="account-address">{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much do you want to deposit?
                      <br></br>
                      (min. amount is 0.01 ETH)
                      <br></br>
                      (1 deposit is possible at the time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          amount = parseFloat(amount); // No need to convert to wei here
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                            className="form-control form-control-md"
                            placeholder="amount..."
                            required
                          />
                        </div>
                        <button
                          type="submit
"
                          className="btn btn-primary"
                        >
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <br></br>
                    Do you want to withdraw + take interest?
                    <br></br>
                    <br></br>
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  <Tab eventKey="borrow" title="Borrow">
                    <div>
                      <br></br>
                      Do you want to borrow tokens?
                      <br></br>
                      (You'll get 50% of collateral, in Tokens)
                      <br></br>
                      Type collateral amount (in ETH)
                      <br></br>
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.borrowAmount.value;
                          amount = parseFloat(amount); // No need to convert to wei here
                          this.borrow(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <input
                            id="borrowAmount"
                            step="0.01"
                            type="number"
                            ref={(input) => {
                              this.borrowAmount = input;
                            }}
                            className="form-control form-control-md"
                            placeholder="amount..."
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          BORROW
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="payOff" title="Payoff">
                    <div>
                      <br></br>
                      Do you want to pay off the loan?
                      <br></br>
                      (You'll receive your collateral - fee)
                      <br></br>
                      <br></br>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.payOff(e)}
                      >
                        PAYOFF
                      </button>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
