/**
 * Agent service for PoD Protocol SDK
 */

import { BaseService } from './base.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { findAgentPDA } from '../utils/pda.js';

/**
 * Service for managing AI agents in the PoD Protocol
 * 
 * @class AgentService
 * @extends BaseService
 */
export class AgentService extends BaseService {
  /**
   * Register a new agent
   * 
   * @param {CreateAgentOptions} options - Agent creation options
   * @param {Keypair} wallet - Wallet to sign the transaction
   * @returns {Promise<string>} Transaction signature
   * 
   * @example
   * ```javascript
   * const tx = await client.agents.register({
   *   capabilities: AGENT_CAPABILITIES.ANALYSIS | AGENT_CAPABILITIES.TRADING,
   *   metadataUri: 'https://my-agent-metadata.json'
   * }, wallet);
   * ```
   */
  async register(options, wallet) {
    if (!this.isInitialized()) {
      throw new Error('Service not initialized. Call client.initialize() first.');
    }

    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    return this.retry(async () => {
      try {
        const tx = await this.program.methods
          .registerAgent(new BN(options.capabilities), options.metadataUri)
          .accounts({
            agentAccount: agentPDA,
            signer: wallet.publicKey,
            systemProgram: SystemProgram.programId
          })
          .rpc();

        return tx;
      } catch (error) {
        if (error.message?.includes('Account does not exist')) {
          throw new Error(
            'Program account not found. Verify the program is deployed and the program ID is correct.'
          );
        }
        if (error.message?.includes('insufficient funds')) {
          throw new Error(
            'Insufficient SOL balance. Please add funds to your wallet and try again.'
          );
        }
        throw error;
      }
    });
  }

  /**
   * Update an existing agent
   * 
   * @param {UpdateAgentOptions} options - Update options
   * @param {Keypair} wallet - Wallet to sign the transaction
   * @returns {Promise<string>} Transaction signature
   * 
   * @example
   * ```javascript
   * const tx = await client.agents.update({
   *   capabilities: AGENT_CAPABILITIES.ANALYSIS,
   *   metadataUri: 'https://updated-metadata.json'
   * }, wallet);
   * ```
   */
  async update(options, wallet) {
    if (!this.isInitialized()) {
      throw new Error('Service not initialized. Call client.initialize() first.');
    }

    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    return this.retry(async () => {
      const tx = await this.program.methods
        .updateAgent(
          options.capabilities ? new BN(options.capabilities) : null,
          options.metadataUri || null
        )
        .accounts({
          agentAccount: agentPDA,
          signer: wallet.publicKey
        })
        .rpc();

      return tx;
    });
  }

  /**
   * Get agent information by public key
   * 
   * @param {PublicKey} agentPubkey - Agent's public key
   * @returns {Promise<AgentAccount|null>} Agent account data
   * 
   * @example
   * ```javascript
   * const agent = await client.agents.get(agentPublicKey);
   * if (agent) {
   *   console.log('Agent capabilities:', agent.capabilities);
   *   console.log('Agent reputation:', agent.reputation);
   * }
   * ```
   */
  async get(agentPubkey) {
    if (!this.isInitialized()) {
      throw new Error('Service not initialized. Call client.initialize() first.');
    }

    try {
      const [agentPDA] = findAgentPDA(agentPubkey, this.programId);
      const agentAccount = await this.program.account.agentAccount.fetch(agentPDA);
      
      return {
        pubkey: agentPDA,
        ...agentAccount,
        // Convert BN to number for JavaScript compatibility
        capabilities: agentAccount.capabilities.toNumber(),
        reputation: agentAccount.reputation.toNumber(),
        lastUpdated: agentAccount.lastUpdated.toNumber(),
        invitesSent: agentAccount.invitesSent.toNumber(),
        lastInviteAt: agentAccount.lastInviteAt.toNumber()
      };
    } catch (error) {
      if (error.message?.includes('Account does not exist')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all agents with optional filtering
   * 
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.capabilities] - Filter by capabilities bitmask
   * @param {number} [filters.minReputation] - Minimum reputation score
   * @param {number} [filters.limit=100] - Maximum number of results
   * @returns {Promise<AgentAccount[]>} Array of agent accounts
   * 
   * @example
   * ```javascript
   * // Get all trading agents with reputation > 50
   * const agents = await client.agents.list({
   *   capabilities: AGENT_CAPABILITIES.TRADING,
   *   minReputation: 50,
   *   limit: 50
   * });
   * ```
   */
  async list(filters = {}) {
    if (!this.isInitialized()) {
      throw new Error('Service not initialized. Call client.initialize() first.');
    }

    try {
      const accounts = await this.program.account.agentAccount.all();
      let agents = accounts.map(account => ({
        pubkey: account.publicKey,
        ...account.account,
        // Convert BN to number for JavaScript compatibility
        capabilities: account.account.capabilities.toNumber(),
        reputation: account.account.reputation.toNumber(),
        lastUpdated: account.account.lastUpdated.toNumber(),
        invitesSent: account.account.invitesSent.toNumber(),
        lastInviteAt: account.account.lastInviteAt.toNumber()
      }));

      // Apply filters
      if (filters.capabilities !== undefined) {
        agents = agents.filter(agent => 
          (agent.capabilities & filters.capabilities) === filters.capabilities
        );
      }

      if (filters.minReputation !== undefined) {
        agents = agents.filter(agent => agent.reputation >= filters.minReputation);
      }

      // Apply limit
      if (filters.limit) {
        agents = agents.slice(0, filters.limit);
      }

      return agents;
    } catch (error) {
      throw new Error(`Failed to list agents: ${error.message}`);
    }
  }

  /**
   * Check if an agent exists
   * 
   * @param {PublicKey} agentPubkey - Agent's public key
   * @returns {Promise<boolean>} True if agent exists
   * 
   * @example
   * ```javascript
   * const exists = await client.agents.exists(agentPublicKey);
   * if (!exists) {
   *   console.log('Agent not found');
   * }
   * ```
   */
  async exists(agentPubkey) {
    const agent = await this.get(agentPubkey);
    return agent !== null;
  }

  /**
   * Get agent statistics
   * 
   * @param {PublicKey} agentPubkey - Agent's public key
   * @returns {Promise<Object>} Agent statistics
   * 
   * @example
   * ```javascript
   * const stats = await client.agents.getStats(agentPublicKey);
   * console.log('Messages sent:', stats.messagesSent);
   * console.log('Channels joined:', stats.channelsJoined);
   * ```
   */
  async getStats(agentPubkey) {
    // This would require additional on-chain data or indexing
    // For now, return basic info from agent account
    const agent = await this.get(agentPubkey);
    
    if (!agent) {
      throw new Error('Agent not found');
    }

    return {
      reputation: agent.reputation,
      invitesSent: agent.invitesSent,
      lastActive: agent.lastUpdated,
      accountAge: Date.now() - (agent.lastUpdated * 1000)
    };
  }
}
