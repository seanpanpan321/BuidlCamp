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


const { Col } = Row;

const App = () => {
  const [chain, setChain] = useState("devnet");
  const [testLabel, setTestLabel] = useState("");
  const SolanaApi = useMoralisSolanaApi();
  const [walletAddress, setWalletAddress] = useState(null);
  const [output, setOutput] = useState("");
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
      if (window.solana){
        const solana = window.solana;
        if (solana.isPhantom) {
          setTestLabel(testLabel + "Phantom Wallet found");
          const res = await solana.connect({onlyIfTrusted: true})
          wallet = res;
          setOutput(res);
          setTestLabel(testLabel + res.publicKey.toString())
          setWalletAddress(res.publicKey.toString());
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
      setOutput(res);
      setWalletAddress(res.publicKey.toString())
    }else{
      setTestLabel(testLabel + "Not found");
    }
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
              {testLabel}
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
            {walletAddress && (
              <div>
                  <p>
                    Connected account : {' '}
                    <span className = "address"> {walletAddress}</span>
                    <p>
                      ABC {JSON.stringify(output)}
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
