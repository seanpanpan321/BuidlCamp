import { useState, useEffect } from "react";
import {
  useMoralis,
  useMoralisSolanaApi,
  useMoralisSolanaCall,
} from "react-moralis";
import {
  Badge,
  Button,
  Row,
  Select,
  Icon,
  Blockie,
  Tag,
  getEllipsisTxt,
} from "web3uikit";
import SolanaNFTCard from "./components/SolanaNFTCard";
import MoralisLogo from "./assets/moralis_logo.jpeg";
import wallet from "./library/wallet"
import {LAMPORTS_PER_SOL} from "@solana/web3.js";


const web3 = require("@solana/web3.js")

const { Col } = Row;

const App = () => {
  const [chain, setChain] = useState("devnet");
  const [testLabel, setTestLabel] = useState("");
  const SolanaApi = useMoralisSolanaApi();
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletObj, setWalletObj] = useState(null);
  const [balance, setBalance] = useState("");
  const [connection, setConn] = useState(null);
  const [temp, setTemp] = useState(null); 
  var wallet = null;
  const {
    user,
    isInitialized,
    isAuthenticated,
    isWeb3Enabled,
    isWeb3EnableLoading,
    isAuthenticating,
    authenticate,
    enableWeb3,
    logout,
  } = useMoralis();
  


  const { data } = useMoralisSolanaCall(
    SolanaApi?.account?.getNFTs,
    {
      network: chain,
      address: user?.get("solAddress"),
    },
    {
      autoFetch: true,
    }
  );

  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      !isWeb3Enabled &&
      isWeb3EnableLoading
    ) {
      enableWeb3({ type: "sol" });
    }
  }, [
    enableWeb3,
    isAuthenticated,
    isInitialized,
    isWeb3EnableLoading,
    isWeb3Enabled,
  ]);

  window.onload = async function(){
    try{
      setWalletObj(null);
      if (window.solana){
        const solana = window.solana;
        if (solana.isPhantom) {
          setTestLabel(testLabel + "Phantom Wallet found");
        }
      }
    }
    catch (error){
      setTestLabel(testLabel + "Not found");
    }
  }

  const connectWallet = async()=>{
    if (window.solana){
      const solana = window.solana;
      const res = await solana.connect();
      setWalletObj(res);
      setWalletAddress(res.publicKey.toString());
      let connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
      setConn(connection);
      const value = connection.getBalance(res.publicKey)
      .then((value) => { 
          const balance = value/LAMPORTS_PER_SOL;
          setBalance(balance);
        }
      );
      setTestLabel(testLabel + res.publicKey.toString())
      setWalletAddress(res.publicKey.toString());
    }else{
      setTestLabel(testLabel + "Not found");
    }
  }

  const checkout = async () => {
    let fromKeypair = web3.Keypair.generate();
    let toKeypair = {
      publicKey: "DxefcmSRS6AEk2TjqNUokij4jJYqh3dSQQrw9yaZAjxk",
      secretKey: 'shit'
  };

    const airdropSignature = await connection.requestAirdrop(
      fromKeypair.publicKey,
      web3.LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(airdropSignature);
  
    const transaction = new web3.Transaction();
    transaction.add(
      web3.SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toKeypair.publicKey,
        lamports: web3.LAMPORTS_PER_SOL / 100,
      }),
    );
    
    // let airdropSignature = await connection.requestAirdrop(
    //   fromKeypair.publicKey,
    //   web3.LAMPORTS_PER_SOL,
    // );
    
    // Sign transaction, broadcast, and confirm
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair],
    );

    
    await connection.confirmTransaction({ signature });
  }

  return (
    <Row alignItems="center" justifyItems="center">
      <Col
        isFullWidth
        style={{
          boxShadow: "rgb(0 0 0 / 8%) 0px 4px 15px",
          zIndex: 100,
        }}
      >
        <div style={{ margin: "0.5rem" }}>
          <Row alignItems="center" justifyItems="space-between">
            <img src={MoralisLogo} alt="Moralis" width="80px" height="auto" />
            <Row alignItems="center">
              <Select
                defaultOptionIndex={1}
                width="220px"
                value={chain}
                onChange={(option) => setChain(option?.id)}
                options={[
                  {
                    id: "mainnet",
                    label: "Solana Mainnet",
                    prefix: <Icon fill="#68738D" svg="solana" />,
                  },
                  {
                    id: "devnet",
                    label: "Solana Devnet",
                    prefix: <Icon fill="#68738D" svg="solana" />,
                  },
                ]}
              />
              {isAuthenticated ? (
                <div onClick={() => logout()} style={{ cursor: "pointer" }}>
                  <Blockie seed={user?.get("solAddress")} size={12} />
                </div>
              ) : (
                <Button
                  icon="solana"
                  onClick={() => authenticate({ type: "sol" })}
                  isLoading={isAuthenticating || isWeb3EnableLoading}
                  size="large"
                  text="Connect Wallet"
                  theme="primary"
                  type="button"
                  style={{ height: "56px" }}
                />
              )}
            </Row>
          </Row>
        </div>
      </Col>
      {isAuthenticated ? (
        <>
          <Col isFullWidth style={{ marginTop: "3rem" }}>
            <Row alignItems="center" justifyItems="center">
              <Blockie seed={user?.get("solAddress")} size={35} />
            </Row>
          </Col>
          <Col isFullWidth>
            <Row alignItems="center" justifyItems="center">
              <Tag text={getEllipsisTxt(user?.get("solAddress"))} />
            </Row>
          </Col>
          <Col isFullWidth style={{ marginLeft: "3rem", marginRight: "3rem" }}>
            <Badge
              text="NFT Portfolio"
              textVariant="h6"
              style={{ width: "150px", cursor: "pointer" }}
            />
          </Col>
          <Col isFullWidth style={{ marginLeft: "3rem", marginRight: "3rem" }}>
            <hr style={{ borderTop: "1px solid rgb(0 0 0 / 8%)" }} />
          </Col>
          <Col isFullWidth style={{ margin: "3rem" }}>
            {data?.map((nft) => {
              return <SolanaNFTCard chain={chain} nftAddress={nft?.mint} />;
            })}
          </Col>
        </>
      ) : (
        <>
          {/* <Col isFullWidth style={{ marginTop: "7rem" }}>
            <Row alignItems="center" justifyItems="center">
              <p style={{ textAlign: "center", fontSize: "64px" }}>
                <b>Solana NFT Dashboard</b>
              </p>
            </Row>
            <Row alignItems="center" justifyItems="center">
              <img
                src={MoralisLogo}
                alt="Moralis"
                width="300px"
                height="auto"
              />
            </Row>
          </Col> */
          <div>
            <Row>
              <label>Here</label>
              <label>{ JSON.stringify(walletObj) }</label>
            </Row>
            {!walletAddress && (
              <div>
                <Button
                  icon = "solana"
                  size="large"
                  text = "Connect Wallet"
                  theme = "primary"
                  type = "button"
                  onClick={connectWallet}
                  style = {{height: "56px"}}
                />
              </div>
            )}
            <div>
              <Button
                icon = "solana"
                size="large"
                text = "Pay"
                theme = "primary"
                type = "button"
                onClick={checkout}
                style = {{height: "56px"}}
              />
            </div>
            {walletAddress && (
              <div>
                  <p>
                    Connected account : {' '}
                    <span className = "address"> {walletAddress}</span>
                    <p>
                      Connection: {JSON.stringify(connection.toString())}
                    </p>
                    <p>
                      Balance: {JSON.stringify(balance)}
                    </p>
                  </p>
              </div>
            )}

          </div>
          }
        </>
      )}
    </Row>
  );
};

export default App;
