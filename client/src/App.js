import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Hip from "./utils/Hip.json";
import "./styles/App.css";

const REACT_APP_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const HIP = Hip.abi;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DEFAULT_CONTRACT = null;
const DEFAULT_ACCOUNT = null;
const DEFAULT_CHAIN = null;
const DEFAULT_ARTIST = "";
const DEFAULT_SONG = "";
const DEFAULT_LINK = "";
const DEFAULT_RECS = [];

const App = () => {
  const [contract, setContract] = useState(DEFAULT_CONTRACT);
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [chain, setChain] = useState(DEFAULT_CHAIN);
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [song, setSong] = useState(DEFAULT_SONG);
  const [link, setLink] = useState(DEFAULT_LINK);
  const [recs, setRecs] = useState(DEFAULT_RECS);

  useEffect(() => {
    isConnected();
  }, []);

  useEffect(() => {
    if (contract) {
      contract.on("NewRec", onNewRec);
    }
    return () => {
      if (contract) {
        contract.off("NewRec", onNewRec);
      }
    };
  }, [contract]);

  useEffect(() => {
    if (contract && account && chain === "0x5") {
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
        params: [{ chainId: "0x5" }],
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
    setArtist(DEFAULT_ARTIST);
    setSong(DEFAULT_SONG);
    setLink(DEFAULT_LINK);
  };

  const onNewRec = (
    sender,
    recId,
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
        address: sender,
        id: recId,
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
          <button className="button" onClick={connectWallet}>
            connect metamask
          </button>
        ) : chain !== "0x5" ? (
          <button className="button" onClick={switchChain}>
            switch to goerli
          </button>
        ) : (
          <>
            <p>artist</p>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} />
            <p>song</p>
            <input value={song} onChange={(e) => setSong(e.target.value)} />
            <p>youtube link</p>
            <input value={link} onChange={(e) => setLink(e.target.value)} />
            <button className="button" onClick={recommend}>
              send rec
            </button>
            {recs.reverse().map((rec, i) => {
              const address =
                rec.address.substring(0, 5) +
                "..." +
                rec.address.substring(rec.address.length - 3);
              const date =
                rec.timestamp.getHours() +
                ":" +
                rec.timestamp.getMinutes() +
                " on " +
                MONTHS[rec.timestamp.getMonth() + 1] +
                " " +
                rec.timestamp.getDate() +
                ", " +
                rec.timestamp.getFullYear();
              const txn = "https://goerli.etherscan.io/address/" + rec.address;
              const link = rec.link.split("?v=")[1];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    border: "solid white 2px",
                    borderRadius: "10px",
                    margin: "20px 0px 20px 0px",
                    backgroundColor: "OldLace",
                  }}
                >
                  <p>
                    <a className="link" href={txn} target="_blank">
                      {address} @ {date}
                    </a>
                  </p>
                  <p>
                    {rec.song} by {rec.artist}
                  </p>
                  <iframe
                    width="560"
                    height="315"
                    src={"https://www.youtube.com/embed/" + link}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
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
