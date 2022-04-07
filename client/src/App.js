import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Hip from "./utils/Hip.json";
import "./styles/App.css";

const REACT_APP_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const HIP = Hip.abi;

const App = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chain, setChain] = useState(null);
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [link, setLink] = useState("");
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isConnected();
  }, []);

  useEffect(() => {
    contract.on("NewRec", onNewRec);
    return () => {
      contract.off("NewRec", onNewRec);
    };
  }, [contract]);

  useEffect(() => {
    if (contract && account && chain === "0x4") {
      getRecs();
    }
  }, [contract, account, chain]);

  const isConnected = async () => {
    function handleAccountsChanged() {
      window.location.reload();
    }
    function handleChainChanged() {
      window.location.reload();
    }
    try {
      if (!window.ethereum) {
        alert("download metamask @ https://metamask.io/download/");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        REACT_APP_CONTRACT_ADDRESS,
        HIP,
        signer
      );
      setContract(contract);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAccount(accounts[0]);
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChain(chainId);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("download metamask @ https://metamask.io/download/");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const switchChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x4" }],
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChain(chainId);
    } catch (error) {
      console.error(error);
    }
  };

  const getRecs = async () => {
    try {
      const txn = await contract.getRecs();
      const recs = txn.map((rec) => {
        return {
          address: rec.sender,
          timestamp: new Date(rec.timestamp * 1000),
          artist: rec.artist,
          song: rec.song,
          link: rec.link,
          upvotes: rec.upvotes,
          downvotes: rec.downvotes,
        };
      });
      setRecs(recs);
    } catch (error) {
      console.error(error);
    }
  };

  const recommend = async () => {
    try {
      const txn = await contract.rec(artist, song, link, {
        gasLimit: 1000000,
      });
      await txn.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const onNewRec = (
    recId,
    sender,
    timestamp,
    artist,
    song,
    link,
    upvotes,
    downvotes
  ) => {
    setRecs((prev) => [
      ...prev,
      {
        id: recId,
        address: sender,
        timestamp: new Date(timestamp * 1000),
        artist,
        song,
        link,
        upvotes,
        downvotes,
      },
    ]);
  };

  return (
    <div className="main">
      <div className="card">
        <div className="header">hip</div>
        <div className="description">send some music recs homie</div>
        {!account ? (
          <>
            <button className="button" onClick={connectWallet}>
              connect metamask
            </button>
          </>
        ) : chain !== "0x4" ? (
          <>
            <button className="button" onClick={switchChain}>
              switch to rinkeby
            </button>
          </>
        ) : (
          <>
            <br />
            <p>artist:</p>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} />
            <p>song:</p>
            <input value={song} onChange={(e) => setSong(e.target.value)} />
            <p>link:</p>
            <input value={link} onChange={(e) => setLink(e.target.value)} />
            <button className="button" onClick={recommend}>
              send rec
            </button>
            {recs.map((rec, i) => {
              return (
                <div
                  key={i}
                  style={{
                    padding: "8px",
                    border: "solid white 2px",
                    borderRadius: "10px",
                    marginTop: "16px",
                    backgroundColor: "OldLace",
                  }}
                >
                  <div>
                    {rec.address} @ {rec.timestamp.toString()}
                  </div>
                  <div>
                    {rec.song} by {rec.artist}
                  </div>
                  <div>
                    <iframe
                      width="560"
                      height="315"
                      src={rec.link}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
