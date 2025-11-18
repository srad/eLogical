import { describe, it, expect } from 'vitest'
import { Node, ConstNode } from '@/lib/compiler/tree'
import {
  fnAnd,
  fnNot,
  fnOr,
  fnEq,
  fnFalse,
  fnImpl,
  fnTrue,
  fnXor,
  fnParens,
} from '@/lib/compiler/language'

const constNode = new ConstNode('v0')

describe('tree.ts', () => {
  it('ConstNode literal', () => {
    expect(constNode.to() === 'v0').toBe(true)
  })

  it('ConstNode literal', () => {
    expect(new ConstNode('v').to() === 'v').toBe(true)
  })

  it('Invalid ConstNode value', () => {
    expect(() => {
      new ConstNode('0')
    }).toThrow()
  })

  it('Invalid ConstNode value', () => {
    expect(() => {
      new ConstNode('0uiohn')
    }).toThrow()
  })

  it('ConstNode literal to tex', () => {
    expect(constNode.to('tex') === 'v_{0}').toBe(true)
  })

  it('ConstNode literal in parens serialize', () => {
    const node = new Node({ fw: fnParens, children: [constNode] })
    expect(node.to() === '(v0)').toBe(true)
  })

  it('True serialize', () => {
    const node = new Node({ fw: fnTrue })
    expect(node.to() === 'true').toBe(true)
  })

  it('false serialize', () => {
    const node = new Node({ fw: fnFalse })
    expect(node.to() === 'false').toBe(true)
  })

  const and = new Node({
    fw: fnAnd,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })

  it('eval AND expression (true  AND  true)  => true', () =>
    expect(and.evaluate({ v0: true, v1: true })).toBe(true))

  it('eval AND expression (true  AND false) => false', () =>
    expect(and.evaluate({ v0: true, v1: false })).toBe(false))

  it('eval AND expression (false AND  true) => false', () =>
    expect(and.evaluate({ v0: false, v1: true })).toBe(false))

  it('eval AND expression (false AND false) => false', () =>
    expect(and.evaluate({ v0: false, v1: false })).toBe(false))

  it('eval AND expression (true  AND false) => false', () =>
    expect(and.evaluate({ v0: true })).toBe(false))

  it('eval AND expression (false AND  true) => false', () =>
    expect(and.evaluate({ v1: true })).toBe(false))

  it('eval AND expression (false AND false) => false', () =>
    expect(and.evaluate({})).toBe(false))

  const or = new Node({
    fw: fnOr,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })

  it('eval OR expression: (true  OR true)  => true', () =>
    expect(or.evaluate({ v0: true, v1: true })).toBe(true))

  it('eval OR expression: (true  OR false) => true', () =>
    expect(or.evaluate({ v0: true, v1: false })).toBe(true))

  it('eval OR expression: (false OR true)  => true', () =>
    expect(or.evaluate({ v0: false, v1: true })).toBe(true))

  it('eval OR expression: (false OR false) => true', () =>
    expect(or.evaluate({ v0: false, v1: false })).toBe(false))

  it('eval OR expression: (true  OR false) => true', () =>
    expect(or.evaluate({ v0: true })).toBe(true))

  it('eval OR expression: (false OR  true) => true', () =>
    expect(or.evaluate({ v1: true })).toBe(true))

  it('eval OR expression: (false OR false) => false', () =>
    expect(or.evaluate({})).toBe(false))

  const impl = new Node({
    fw: fnImpl,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })

  it('eval IMPLICATION expression: (true  -> true)  => true', () =>
    expect(impl.evaluate({ v0: true, v1: true })).toBe(true))

  it('eval IMPLICATION expression: (true  -> false) => false', () =>
    expect(impl.evaluate({ v0: true })).toBe(false))

  it('eval IMPLICATION expression: (false -> true)  => true', () =>
    expect(impl.evaluate({ v1: true })).toBe(true))

  it('eval IMPLICATION expression: (false -> false) => false', () =>
    expect(impl.evaluate({})).toBe(true))

  it('eval eval NOT expression: !true => false', () => {
    const node = new Node({ fw: fnNot, children: [new ConstNode('v0')] })
    expect(node.evaluate({ v0: true })).toBe(false)
  })

  it('eval NOT expression: !false => true', () => {
    const node = new Node({ fw: fnNot, children: [new ConstNode('v0')] })
    expect(node.evaluate({})).toBe(true)
  })

  const xor = new Node({
    fw: fnXor,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })

  it('eval XOR expression: (true XOR true) => true', () =>
    expect(xor.evaluate({ v0: true, v1: true })).toBe(false))

  it('eval XOR expression: (true XOR false) => false', () =>
    expect(xor.evaluate({ v0: true })).toBe(true))

  it('eval XOR expression: (false XOR true) => true', () =>
    expect(xor.evaluate({ v1: true })).toBe(true))

  it('eval XOR expression: (false XOR false) => false', () =>
    expect(xor.evaluate({})).toBe(false))

  const eq = new Node({
    fw: fnEq,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })

  it('eval EQ expression: (true == true) => true', () =>
    expect(eq.evaluate({ v0: true, v1: true })).toBe(true))

  it('eval EQ expression: (true == false) => false', () =>
    expect(eq.evaluate({ v0: true })).toBe(false))

  it('eval EQ expression: (false == true) => false', () =>
    expect(eq.evaluate({ v1: true })).toBe(false))

  it('eval EQ expression: (false == false) => true', () =>
    expect(eq.evaluate({})).toBe(true))

  const and1 = new Node({
    fw: fnAnd,
    children: [new ConstNode('v0'), new ConstNode('v1')],
  })
  const notAnd = new Node({ fw: fnNot, children: [and1] })

  it('eval expression: NoT(false AND false) => true', () =>
    expect(notAnd.evaluate({ v0: false, v1: false })).toBe(true))

  it('eval expression: NOT(true  AND false) => true', () =>
    expect(notAnd.evaluate({ v0: true, v1: false })).toBe(true))

  it('eval expression: NOT(false AND  true) => true', () =>
    expect(notAnd.evaluate({ v0: false, v1: true })).toBe(true))

  it('eval expression: NOT(false AND false) => true', () =>
    expect(notAnd.evaluate({ v0: false })).toBe(true))

  it('eval expression: NOT(false AND false) => true', () =>
    expect(notAnd.evaluate({ v1: false })).toBe(true))

  it('eval expression: NOT(false AND false) => true', () =>
    expect(notAnd.evaluate({})).toBe(true))

  it('eval expression: NOT(true  AND  true) => false', () =>
    expect(notAnd.evaluate({ v0: true, v1: true })).toBe(false))

  it('(not (and ...)) ops', () =>
    expect(notAnd.ops()).toEqual(['not', 'and']))

  it('(and ...) ops', () => expect(or.ops()).toEqual(['or']))

  it('(and ...) ops', () => expect(and.ops()).toEqual(['and']))

  it('(eq ...) ops', () => expect(eq.ops()).toEqual(['eq']))

  it('(xor ...) ops', () => expect(xor.ops()).toEqual(['xor']))

  it('(implication ...) ops', () =>
    expect(impl.ops()).toEqual(['implication']))
})
