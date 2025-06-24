/**
 * PDA (Program Derived Address) utilities for PoD Protocol
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Find Program Derived Address for an agent
 * 
 * @param {PublicKey} agentPubkey - Agent's public key
 * @param {PublicKey} programId - Program ID
 * @returns {[PublicKey, number]} PDA and bump seed
 */
export function findAgentPDA(agentPubkey, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), agentPubkey.toBuffer()],
    programId
  );
}

/**
 * Find Program Derived Address for a message
 * 
 * @param {PublicKey} sender - Sender's public key
 * @param {PublicKey} recipient - Recipient's public key
 * @param {Buffer} payloadHash - Message payload hash
 * @param {PublicKey} programId - Program ID
 * @returns {[PublicKey, number]} PDA and bump seed
 */
export function findMessagePDA(sender, recipient, payloadHash, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('message'),
      sender.toBuffer(),
      recipient.toBuffer(),
      payloadHash
    ],
    programId
  );
}

/**
 * Find Program Derived Address for a channel
 * 
 * @param {PublicKey} creator - Channel creator's public key
 * @param {string} name - Channel name
 * @param {PublicKey} programId - Program ID
 * @returns {[PublicKey, number]} PDA and bump seed
 */
export function findChannelPDA(creator, name, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('channel'),
      creator.toBuffer(),
      Buffer.from(name, 'utf-8')
    ],
    programId
  );
}

/**
 * Find Program Derived Address for escrow
 * 
 * @param {PublicKey} channel - Channel public key
 * @param {PublicKey} depositor - Depositor's public key
 * @param {PublicKey} programId - Program ID
 * @returns {[PublicKey, number]} PDA and bump seed
 */
export function findEscrowPDA(channel, depositor, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('escrow'),
      channel.toBuffer(),
      depositor.toBuffer()
    ],
    programId
  );
}

/**
 * Find Program Derived Address for channel participant
 * 
 * @param {PublicKey} channel - Channel public key
 * @param {PublicKey} participant - Participant's public key
 * @param {PublicKey} programId - Program ID
 * @returns {[PublicKey, number]} PDA and bump seed
 */
export function findChannelParticipantPDA(channel, participant, programId) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('participant'),
      channel.toBuffer(),
      participant.toBuffer()
    ],
    programId
  );
}
