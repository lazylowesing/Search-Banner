import React, { Component } from 'react';
import Banner from './banner/banner.jsx';
import Navbar from './navBar.jsx';
import axios from 'axios';
import adjust from '../style/adjust.less';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deptList: ['Appliances', 'Bathroom', 'Building Supplies', 'Doors and Windows', 'Electrical'],
      sortedCategorySet: [],
      itemList: [],
      suggestionList: [],
      dataList: {},
      filteredList: [],
      noMatch: false,
      cartItemList: [{id: 3, name: 'ceiling fan', amount: 3, price: 45.00}, {id: 5, name: 'idk', amount: 2, price: 90.00}, {id: 71, name: 'hello', amount: 5, price: 100.00}],
      cartNumItemTotal: 0,
      toggleSuggestion: false,
      showCart: false,
      showDept: false,
      browsing: false
    }
    this.deployed = false;
    this.ip = this.deployed ? 'http://search-banner.us-east-1.elasticbeanstalk.com' : '';
    this.handleSearch = this.handleSearch.bind(this);
    this.suggestionToggler = this.suggestionToggler.bind(this);
    this.cartModalToggler = this.cartModalToggler.bind(this);
    this.deptToggler = this.deptToggler.bind(this);
    this.handleBrowsing = this.handleBrowsing.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  componentDidMount() {
    let total = 0;
    for (let index = 0; index < this.state.cartItemList.length; index++) {
      const element = this.state.cartItemList[index].amount;
      total += element;
    }
    // TO BE DONE WHEN SOMETHING IS ADDED TO CART
    // axios.post(this.ip + '/savecart', { cartItemList: this.state.cartItemList}).then(() => {
    //   console.log('saved!')
    // })


    axios.get( this.ip + '/itemlist').then((itemlist) => {
      // axios.get('/itemlist').then((itemlist) => {
      let data = {};
      itemlist.data.forEach((item) => {
        data[item.category] = item;
      })
      // console.log(itemlist.data);
      this.setState({
        
          dataList: data,
          deptList: [... new Set(itemlist.data.map((item) => {
            let dept = item.department;
            return dept;
          }).sort())],
          itemList: itemlist.data.map((item) => {
            let category = item.category;
            return category;
          }),
          sortedCategorySet: [... new Set(itemlist.data.map((item, i) => {
            return item.category;
          }))],
          cartNumItemTotal: total
        
    });
    })
  }

  removeItem(cartId) {
    console.log(cartId);
    this.state.cartItemList[cartId].amount = this.state.cartItemList[cartId].amount - 1;
    this.setState({cartNumItemTotal: this.state.cartNumItemTotal-1, cartItemList: this.state.cartItemList}, () => {
      axios.post(this.ip + '/savecart', { cartItemList: this.state.cartItemList}).then(() => {
        console.log('saved!')
      })
    });
  }

  addItem(cartId) {
    console.log(cartId);
    this.state.cartItemList[cartId].amount = this.state.cartItemList[cartId].amount + 1;
    this.setState({cartNumItemTotal: this.state.cartNumItemTotal+1, cartItemList: this.state.cartItemList}, () => {
      axios.post(this.ip + '/savecart', { cartItemList: this.state.cartItemList}).then(() => {
        console.log('saved!')
      })
    });
  }

  deptToggler() {
    this.setState({showDept: !this.state.showDept})
  }

  suggestionToggler() {
    this.setState({toggleSuggestion: !this.state.toggleSuggestion});
  }

  cartModalToggler() {
    this.setState({showCart: !this.state.showCart});
  }

  handleBrowsing() {
    this.setState({browsing: !this.state.browsing});
  }

  handleSearch(e, hovering) {
    const { itemList } = this.state;
    const filteredDataList = itemList.filter(item => item.toLowerCase().startsWith(e.target.value.toLowerCase()));
    
    
      if(!hovering) {
        this.setState({filteredList: [... new Set(filteredDataList)]}, () => {
          axios.get( this.ip + `/item?category=${filteredDataList[0]}`).then((result) => {
            // axios.get(`/item?category=${filteredDataList[0]}`).then((result) => {
            let suggestionList = result.data;
            this.setState({ suggestionList });
          })
        });
      } else {
        axios.get( this.ip + `/item?category=${filteredDataList[0]}`).then((result) => {
          // axios.get(`/item?category=${filteredDataList[0]}`).then((result) => {
            let suggestionList = result.data;
            this.setState({ suggestionList });
          })
      }
    
  }



  render() { 
    return ( 
      <header>
        <div className="container">
        <Banner 
          cartNumItemTotal={this.state.cartNumItemTotal} 
          showCart={this.state.showCart} 
          addItem={this.addItem}
          cartItemList={this.state.cartItemList}
          removeItem={this.removeItem}
          cartModalToggler={this.cartModalToggler}
        />
        </div>
        <Navbar 
          browsing={this.state.browsing}
          handleBrowsing={this.handleBrowsing}
          handleSearch={this.handleSearch} 
          filteredList={this.state.filteredList} 
          dataList={this.state.dataList}
          deptList={this.state.deptList}
          suggestionList={this.state.suggestionList}
          suggestionToggler={this.suggestionToggler}
          toggleSuggestion={this.state.toggleSuggestion}
          deptToggler={this.deptToggler}
          showDept={this.state.showDept}
          sortedCategorySet={this.state.sortedCategorySet}
        />
        {this.state.showDept ? 
            <div className={`${adjust.greyOut}`}></div>
            :
            null
          }
      </header>
     );
  }
}
 
export default App;