import { describe, it, expect, beforeEach } from "vitest"

type ContractResult<T> = { value: T } | { error: number }

const admin = "ST1ADMIN0000000000000000000000000000000000"
const user1 = "ST1USER1000000000000000000000000000000000"
const user2 = "ST1USER2000000000000000000000000000000000"

let contractState: {
  admin: string
  nextId: number
  contracts: Map<number, {
    creator: string
    counterparty: string
    descriptionHash: string
    amount: number
    status: number
    verdict: boolean | null
  }>
  balances: Map<string, number>
}

beforeEach(() => {
  contractState = {
    admin,
    nextId: 1,
    contracts: new Map(),
    balances: new Map(),
  }
})

function createContract(caller: string, counterparty: string, hash: string, amount: number): ContractResult<number> {
  const id = contractState.nextId++
  contractState.contracts.set(id, {
    creator: caller,
    counterparty,
    descriptionHash: hash,
    amount,
    status: 0,
    verdict: null,
  })
  return { value: id }
}

function agreeContract(caller: string, id: number): ContractResult<true> {
  const c = contractState.contracts.get(id)
  if (!c) return { error: 101 }
  if (caller !== c.counterparty) return { error: 103 }
  if (c.status !== 0) return { error: 102 }
  c.status = 1
  return { value: true }
}

function fundEscrow(caller: string, id: number, amount: number): ContractResult<true> {
  const c = contractState.contracts.get(id)
  if (!c) return { error: 101 }
  if (![c.creator, c.counterparty].includes(caller)) return { error: 103 }
  contractState.balances.set(`${id}-${caller}`, amount)
  return { value: true }
}

function disputeContract(caller: string, id: number): ContractResult<true> {
  const c = contractState.contracts.get(id)
  if (!c) return { error: 101 }
  if (![c.creator, c.counterparty].includes(caller)) return { error: 103 }
  if (c.status !== 1) return { error: 104 }
  c.status = 2
  return { value: true }
}

function resolveDispute(caller: string, id: number, verdict: boolean): ContractResult<{ paidTo: string; amount: number }> {
  const c = contractState.contracts.get(id)
  if (!c) return { error: 101 }
  if (caller !== contractState.admin) return { error: 100 }
  if (c.status !== 2) return { error: 102 }

  const creatorAmount = contractState.balances.get(`${id}-${c.creator}`) || 0
  const counterpartyAmount = contractState.balances.get(`${id}-${c.counterparty}`) || 0
  const total = creatorAmount + counterpartyAmount

  const winner = verdict ? c.creator : c.counterparty
  c.status = 3
  c.verdict = verdict

  return { value: { paidTo: winner, amount: total } }
}

describe("P2P Legal Enforcement Contract", () => {
  it("should allow contract creation", () => {
    const res = createContract(user1, user2, "hash123", 1000)
    if ("value" in res) {
      expect(res.value).toBe(1)
    } else {
      throw new Error(`Unexpected error: ${res.error}`)
    }
  })

  it("should allow counterparty to agree", () => {
    const created = createContract(user1, user2, "hash123", 1000)
    if (!("value" in created)) throw new Error(`Create failed: ${created.error}`)

    const res = agreeContract(user2, created.value)
    if ("value" in res) {
      expect(res.value).toBe(true)
    } else {
      throw new Error(`Unexpected error: ${res.error}`)
    }
  })

  it("should fund escrow", () => {
    const created = createContract(user1, user2, "hash123", 1000)
    if (!("value" in created)) throw new Error(`Create failed: ${created.error}`)

    const res = fundEscrow(user1, created.value, 1000)
    if ("value" in res) {
      expect(res.value).toBe(true)
    } else {
      throw new Error(`Unexpected error: ${res.error}`)
    }
  })

  it("should allow dispute by either party", () => {
    const created = createContract(user1, user2, "hash123", 1000)
    if (!("value" in created)) throw new Error(`Create failed: ${created.error}`)

    agreeContract(user2, created.value)

    const res = disputeContract(user1, created.value)
    if ("value" in res) {
      expect(res.value).toBe(true)
    } else {
      throw new Error(`Unexpected error: ${res.error}`)
    }
  })

  it("should allow admin to resolve dispute with verdict", () => {
    const created = createContract(user1, user2, "hash123", 1000)
    if (!("value" in created)) throw new Error(`Create failed: ${created.error}`)
    const id = created.value

    agreeContract(user2, id)
    fundEscrow(user1, id, 1000)
    fundEscrow(user2, id, 1000)
    disputeContract(user1, id)

    const res = resolveDispute(admin, id, true)
    if ("value" in res) {
      expect(res.value.paidTo).toBe(user1)
      expect(res.value.amount).toBe(2000)
    } else {
      throw new Error(`Unexpected error: ${res.error}`)
    }
  })
})
