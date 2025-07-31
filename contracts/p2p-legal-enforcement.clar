;; SPDX-License-Identifier: MIT
;; P2P Legal Contract Enforcement in Clarity

(define-data-var admin principal tx-sender)
(define-data-var next-contract-id uint u1)

;; Error constants
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-BAD-STATE u102)
(define-constant ERR-NOT-PARTY u103)
(define-constant ERR-ALREADY-DISPUTED u104)

;; Status codes
(define-constant STATUS-CREATED u0)
(define-constant STATUS-AGREED u1)
(define-constant STATUS-DISPUTED u2)
(define-constant STATUS-RESOLVED u3)
(define-constant STATUS-CANCELLED u4)

(define-map legal-contracts
  uint
  {
    creator: principal,
    counterparty: principal,
    description-hash: (buff 32),
    amount: uint,
    status: uint,
    verdict: (optional bool)
  }
)

(define-map escrow-balances
  (tuple (contract-id uint) (party principal))
  uint
)

(define-read-only (is-party (c principal) (p1 principal) (p2 principal))
  (or (is-eq c p1) (is-eq c p2))
)

(define-public (create-contract (counterparty principal) (description-hash (buff 32)) (amount uint))
  (let ((id (var-get next-contract-id)))
    (begin
      (map-set legal-contracts id {
        creator: tx-sender,
        counterparty: counterparty,
        description-hash: description-hash,
        amount: amount,
        status: STATUS-CREATED,
        verdict: none
      })
      (var-set next-contract-id (+ id u1))
      (ok id)
    )
  )
)

(define-public (agree-contract (id uint))
  (match (map-get? legal-contracts id)
    contract-data
      (begin
        (asserts! (is-eq tx-sender (get counterparty contract-data)) (err ERR-NOT-PARTY))
        (asserts! (is-eq (get status contract-data) STATUS-CREATED) (err ERR-BAD-STATE))
        (map-set legal-contracts id {
          creator: (get creator contract-data),
          counterparty: (get counterparty contract-data),
          description-hash: (get description-hash contract-data),
          amount: (get amount contract-data),
          status: STATUS-AGREED,
          verdict: none
        })
        (ok true)
      )
    (err ERR-NOT-FOUND)
  )
)

(define-public (fund-escrow (id uint))
  (match (map-get? legal-contracts id)
    contract-data
      (begin
        (asserts! (is-party tx-sender (get creator contract-data) (get counterparty contract-data)) (err ERR-NOT-PARTY))
        (let ((amount (get amount contract-data)))
          (try! (stx-transfer? amount tx-sender contract-owner))
          (map-set escrow-balances { contract-id: id, party: tx-sender } amount)
          (ok true)
        )
      )
    (err ERR-NOT-FOUND)
  )
)

(define-public (dispute-contract (id uint))
  (match (map-get? legal-contracts id)
    contract-data
      (begin
        (asserts! (is-party tx-sender (get creator contract-data) (get counterparty contract-data)) (err ERR-NOT-PARTY))
        (asserts! (is-eq (get status contract-data) STATUS-AGREED) (err ERR-ALREADY-DISPUTED))
        (map-set legal-contracts id {
          creator: (get creator contract-data),
          counterparty: (get counterparty contract-data),
          description-hash: (get description-hash contract-data),
          amount: (get amount contract-data),
          status: STATUS-DISPUTED,
          verdict: none
        })
        (ok true)
      )
    (err ERR-NOT-FOUND)
  )
)

(define-public (resolve-dispute (id uint) (verdict bool))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    (match (map-get? legal-contracts id)
      contract-data
        (begin
          (asserts! (is-eq (get status contract-data) STATUS-DISPUTED) (err ERR-BAD-STATE))

          (let (
            (creator (get creator contract-data))
            (counterparty (get counterparty contract-data))
            (amount1 (default-to u0 (map-get? escrow-balances { contract-id: id, party: creator })))
            (amount2 (default-to u0 (map-get? escrow-balances { contract-id: id, party: counterparty })))
            (total (+ amount1 amount2))
            (winner (if verdict creator counterparty))
          )
            (try! (stx-transfer? total contract-owner winner))

            (map-set legal-contracts id {
              creator: creator,
              counterparty: counterparty,
              description-hash: (get description-hash contract-data),
              amount: (get amount contract-data),
              status: STATUS-RESOLVED,
              verdict: (some verdict)
            })
            (ok true)
          )
        )
      (err ERR-NOT-FOUND)
    )
  )
)

(define-read-only (get-contract (id uint))
  (map-get? legal-contracts id)
)
