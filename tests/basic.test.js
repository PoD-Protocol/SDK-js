import { describe, it, expect } from '@jest/globals';
import { PodProtocolClient } from '../src/index.js';
import { Connection, PublicKey } from '@solana/web3.js';

describe('SDK Basic Tests', () => {
  let client;

  beforeEach(() => {
    const connection = new Connection('http://localhost:8899');
    const programId = new PublicKey('11111111111111111111111111111111');
    client = new PodProtocolClient(connection, programId);
  });

  it('should initialize client correctly', () => {
    expect(client).toBeDefined();
    expect(client.agent).toBeDefined();
    expect(client.message).toBeDefined();
    expect(client.channel).toBeDefined();
    expect(client.escrow).toBeDefined();
    expect(client.analytics).toBeDefined();
    expect(client.discovery).toBeDefined();
    expect(client.ipfs).toBeDefined();
    expect(client.zkCompression).toBeDefined();
  });

  it('should have all services initialized', () => {
    expect(client.agent.constructor.name).toBe('AgentService');
    expect(client.message.constructor.name).toBe('MessageService');
    expect(client.channel.constructor.name).toBe('ChannelService');
    expect(client.escrow.constructor.name).toBe('EscrowService');
    expect(client.analytics.constructor.name).toBe('AnalyticsService');
    expect(client.discovery.constructor.name).toBe('DiscoveryService');
    expect(client.ipfs.constructor.name).toBe('IPFSService');
    expect(client.zkCompression.constructor.name).toBe('ZKCompressionService');
  });

  it('should pass basic test', () => {
    expect(true).toBe(true);
  });
});
