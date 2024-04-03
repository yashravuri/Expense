import './App.css';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Login from './login.js';

function App() {
  const [loadingData, setLoadingData] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState('None');
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [maxSpendingPerCategory] = useState({
    Food: -3000,
    Groceries: -2000,
    Electronics: -500000,
    Eatables: -10000,
    Clothing: -150000,
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const chartRef = useRef(null);

  const categorySpending = useMemo(() => {
    return {};
  }, []);

  const totalSpendingPerCategory = useMemo(() => {
    const totalSpending = {};
    transactions.forEach((transaction) => {
      const { category, price } = transaction;
      if (!totalSpending[category]) {
        totalSpending[category] = 0;
      }
      totalSpending[category] += price;
    });
    return totalSpending;
  }, [transactions]);
  const barGraphData = {
    labels: Object.keys(totalSpendingPerCategory),
    datasets: [
      {
        label: 'Total Spending',
        data: Object.values(totalSpendingPerCategory),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const barGraphOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const getTransactions = useCallback(async () => {
    const url = process.env.REACT_APP_API_URL + '/transactions';
    const response = await fetch(url);
    const newTransactions = await response.json();

    const updatedCategorySpending = { ...categorySpending };
    newTransactions.forEach((transaction) => {
      const { category, price } = transaction;
      if (!updatedCategorySpending[category]) {
        updatedCategorySpending[category] = 0;
      }
      updatedCategorySpending[category] += price;
    });

    setTransactions(newTransactions);
    setCategory(updatedCategorySpending);
    return newTransactions;
  }, [categorySpending, setCategory]);

  function toggleBarGraph() {
    if (chartRef.current !== null) {
      chartRef.current.chartInstance.destroy();
    }
    setShowBarGraph(!showBarGraph);
  }
  function closeAnalysis() {
    setShowAnalysis(false);
  }

  function addNewTransaction(ev) {
    ev.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/transaction';
    const nameParts = name.split(' ');
    const price = nameParts[0];
    const productName = nameParts.slice(1).join(' ');
    fetch(url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        price,
        name: productName,
        description,
        datetime,
        category,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        setName('');
        setDatetime('');
        setDescription('');
        setCategory('Food');
        getTransactions().then(setTransactions);
      });
  }

  let balance = 0;
  for (const transaction of transactions) {
    balance = balance + transaction.price;
  }
  balance = balance.toFixed(2);
  const fraction = balance.split('.')[1];
  balance = balance.split('.')[0];
  function toggleAnalysis() {
    setShowAnalysis(!showAnalysis);
  }

  useEffect(() => {
    const getTransactions = async () => {
      try {
       
        setTimeout(async () => {
          const url = process.env.REACT_APP_API_URL + '/transactions';
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const newTransactions = await response.json();

          console.log('API Response:', newTransactions);

          setTransactions(newTransactions);
          setLoadingData(false); 
        }, 1500); 
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoadingData(false); 
      }
    };

    getTransactions();
  }, []);

  const handleLogin = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
  }, []);
  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="main-container">
      
      {loadingData ? ( // Loading screen condition
        <div className="loading-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <div>
            <h1>₹{balance}<span>.{fraction}</span></h1>

          <form onSubmit={addNewTransaction} method="post">
            <div className="basic">
              <input
                type="text"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder={'±Amount(in no.) and Made/Spent For'}
              />
              <input
                value={datetime}
                onChange={(ev) => setDatetime(ev.target.value)}
                type="datetime-local"
              />
            </div>
            <div className="category-dropdown">
              <label htmlFor="category">Category:</label>
              <br></br>
              <select
                id="category"
                value={category}
                onChange={(ev) => setCategory(ev.target.value)}
                placeholder ={'Select Category from Dropdown'}
              >
                <option value div name= "SelectCategory">Select Category</option>
                <option value="Food">Food</option>
                <option value="Groceries">Groceries</option>
                <option value="Electronics">Electronics</option>
                <option value="Eatables">Eatables</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
            <div className="description">
              <input
                type="text"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder={'description'}
              />
            </div>
            <button type="submit">Add a new transaction</button>
          </form>
          <div
            className={`${transactions} ${
              showAnalysis ? 'transactions-blur' : ''
            }`}
          >
            {transactions.length > 0 &&
              transactions.map((transaction) => (
                <div className="transaction" key={transaction._id}>
                  <div className="left">
                    <div className="name">{transaction.name}</div>
                    <div className="description">{transaction.description}</div>
                  </div>
                  <div className="right">
                    <div
                      className={`price ${
                        transaction.price < 0 ? 'red' : 'green'
                      }`}
                    >
                      ₹{transaction.price}
                    </div>
                    <div className="datetime">{transaction.datetime}</div>
                  </div>
                </div>
              ))}
          </div>
      

          <button className="show-analysis-button" onClick={toggleAnalysis}>
            Show Analysis
          </button>
          <button className="show-analysis-button" onClick={toggleBarGraph}>
          Toggle Bar Graph
          {showBarGraph && (
  <div className="category-bar-graph">
    <h3>Category Wise Spending (Bar Graph)</h3>
    <Bar data={barGraphData} options={barGraphOptions} ref={chartRef} />
  </div>
)}

          </button>
          {showAnalysis && (
            <div className="overlay">
              <div className="category-analysis category-analysis-table">
                <button className="close-button" onClick={closeAnalysis}>
                  X
                </button>

                <div className="category-total-spending">
                  <h3>CATEGORY ANALYSIS</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total Spending</th>
                        <th>Max Spending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(totalSpendingPerCategory).map((category) => (
                        <tr key={category}>
                          <td>{category}</td>
                          <td
                            className={`price ${
                              totalSpendingPerCategory[category] >
                              maxSpendingPerCategory[category]
                                ? 'text-red'
                                : 'text-green'
                            }`}
                          >
                            ₹{totalSpendingPerCategory[category].toFixed(2)}
                          </td>
                          <td className="price">
                            ₹{maxSpendingPerCategory[category].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
