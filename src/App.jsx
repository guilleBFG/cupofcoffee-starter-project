import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/CupOfCoffeePortal.json';

export default function App() {
	const [currentAccount, setCurrentAccount] = useState('');

	const [userMessage, setUserMessage] = useState('');

  const [amountOfCoffeeRequest, setAmountOfCoffeeRequest] = useState('');
  
	const [allSmallTalks, setAllSmallTalks] = useState([]);

	const contractAddress = '0x9a5518C4BEBA098625D074BD5F46a370Fd465D4d';
	const contractABI = abi.abi;

	const getAllTalks = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const cupOfCoffePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const smallTalks = await cupOfCoffePortalContract.getAllCoffeeTalks();

				let smallTalksCleaned = [];

				smallTalks.forEach(smallTalk => {
					smallTalksCleaned.push({
						address: smallTalk.talker,
						timestamp: new Date(smallTalk.timestamp * 1000),
						message: smallTalk.message
					});
				});

        setAmountOfCoffeeRequest(smallTalksCleaned.length);
        
				setAllSmallTalks(smallTalksCleaned);
			} else {
				console.log('ethereum object does not exist');
			}
		} catch (error) {
			console.log(error);
		}
	};

  /*
  * listen in for emitter event 
  */
  useEffect(( ) => {
    let cupOfCoffePortalContract;

    const onCoffeeTalk = (from, timestamp, message) =>{
      console.log("new coffee request");
      setAllSmallTalks(prevState => [
        ...prevState, {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
      setAmountOfCoffeeRequest(prevState => prevState + 1);

    };


    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer   = provider.getSigner();
      
      cupOfCoffePortalContract = new ethers.Contract(contractAddress,contractABI, signer);
      cupOfCoffePortalContract.on("coffeeTalk", onCoffeeTalk);
    }

    return () =>{
      if(cupOfCoffePortalContract){
        cupOfCoffePortalContract.off("coffeeTalk", onCoffeeTalk);
      }
    };
  },[]);

  
	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Please use Metamask');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			/*
    *  Check if user acount is connected
    */
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('found an authorized account: ', account);
				setCurrentAccount(account);
        getAllTalks();
			} else {
				console.log('no authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const coffee = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();

				const cupOfCoffeePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);
				let count = await cupOfCoffeePortalContract.getTotalCupsOfCoffees();
				console.log('retrives total of cups of coffee...', count.toNumber());

				const buyCoffeeTxn = await cupOfCoffeePortalContract.buyCoffee(
					userMessage.toString(), {gasLimit: 300000 }
				);

				console.log('mining...', buyCoffeeTxn.hash);

				count = await cupOfCoffeePortalContract.getTotalCupsOfCoffees();
				console.log('retrives total of cups of coffee...', count.toNumber());
			} else {
				console.log('Ethereum object does not exist');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleMessage = event => {
		setUserMessage(event.target.value);
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert('please install metamask');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			const account = accounts[0];

			console.log('connected', account);
			setCurrentAccount(account);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hi Welcome to the Coffee shop!</div>

				<div className="bio">
					My name is Guille and I am learning blockchain development.
          Since this is one of the first apps please submit your coffee request!
				</div>

				<input
					required
					className="header"
					placeholder="Place your coffee order here ..."
					onChange={handleMessage}
				/>
				<p>{userMessage}</p>
				<button className="coffeeButton" onClick={coffee}>
					Request a ☕ 
				</button>

				{!currentAccount && (
					<button className="coffeeButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}
        <label>Amount of request: {amountOfCoffeeRequest}</label>
				{allSmallTalks.map((smallTalk, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '8px'
							}}
						>
              <div>Message: {smallTalk.message}</div>
							<div>Address: {smallTalk.address}</div>
							<div>Time: {smallTalk.timestamp.toString()}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
