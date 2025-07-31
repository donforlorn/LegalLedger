# LegalLedger# LegalLedger: Decentralized Legal Dispute Resolution Platform

A blockchain-based platform for managing legal contracts, escrow enforcement, and dispute resolution through smart contracts — empowering individuals and small businesses with transparent, affordable, and trustless legal tools.

---

## 📘 Overview

LegalLedger comprises a modular suite of smart contracts built with Clarity to enable:

- Legally enforceable smart contracts
- Escrow-based milestone tracking
- Decentralized arbitration
- Reputation systems for legal service providers
- On-chain contract templates and registration
- Time-locked evidence handling
- KYC/legal identity attestation

---

## ⚙️ Smart Contracts

### 1. **ContractRegistry**
- Stores metadata and references to all legally-binding contracts
- Version control and access logs
- Proof-of-existence (PoE) hashing for legal document integrity

### 2. **EscrowContract**
- Manages funds locked for contract milestones
- Supports partial releases and mutual unlocks
- Integrates with arbitration in case of disputes

### 3. **DisputeResolutionDAO**
- Allows registered legal professionals or DAO juries to vote on disputes
- Reputation-based selection mechanism
- Rewards and penalties for arbitrators

### 4. **LegalIdentity**
- On-chain KYC/attestation registry
- Verifies legal actors (lawyers, notaries, clients)
- Links to off-chain documents via IPFS or Gaia

### 5. **ContractTemplates**
- Open library of reusable legal contracts (NDAs, SLAs, leases, freelance agreements, etc.)
- Supports parameter injection and digital signing
- Version locking with hash verification

### 6. **EvidenceLocker**
- Time-locked storage of on-chain evidence hashes
- Permission-based viewing
- Supports event-based releases (e.g., milestone deadlines, court order)

### 7. **ReputationSystem**
- Tracks performance and fairness ratings for lawyers, mediators, and clients
- Integrated with arbitration and contract completion
- Helps filter credible actors

### 8. **LegalToken**
- Utility token used for paying arbitration fees, legal document registration, and staking
- Optional integration with stablecoins for escrow

### 9. **MediatorRegistry**
- Maintains a list of certified mediators and their availability
- Includes jurisdiction tags and specialization filters
- Enables mediator assignment via smart contract call

### 10. **ComplianceContract**
- Validates contracts against jurisdiction-specific rules (e.g., contract types legal in certain states)
- Plug-in logic for region-based restrictions

---

## ✨ Features

- Peer-to-peer legal contract execution
- Transparent and enforceable escrow payments
- DAO-based or expert-based dispute resolution
- Legal KYC and actor verification
- On-chain notarization and PoE
- Evidence locking with time-based conditions
- Token-based incentive and access system

---

## 🛠️ Installation

1. Install Clarinet CLI:  
   [https://docs.stacks.co/clarity/clarinet-cli](https://docs.stacks.co/clarity/clarinet-cli)

2. Clone this repository:
   ```bash
   git clone https://github.com/your-org/legal-ledger.git
   ```
3. Navigate to project:
   ```bash
    cd legal-ledger
    ```
4. Run tests:
    ```bash
    npm test
    ```
5. Deploy contracts:
    ```bash
    clarinet deploy
    ```

## 🚀 Usage

Each smart contract is independently deployable and modular. Typical flows involve:

- Creating legal identities using LegalIdentity
- Drafting agreements using ContractTemplates
- Escrowing payments with EscrowContract
- Logging contracts in ContractRegistry
- Resolving disputes via DisputeResolutionDAO
- Rating parties via ReputationSystem

Refer to individual contract documentation under /contracts/ for specific function usage and examples.

## 🧪 Testing

Tests are written using Clarinet and Vitest.
```bash
npm test
```

## 📄 License

MIT License