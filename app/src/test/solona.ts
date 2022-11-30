import { solona } from '../backend';

export function testMint(){
    const walletPubKey = '1234567890'
    solona.mint(walletPubKey);
}