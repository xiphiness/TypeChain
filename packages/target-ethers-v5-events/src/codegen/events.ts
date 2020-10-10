import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from "@ethersproject/strings";
import { values } from 'lodash'
import { Dictionary } from 'ts-essentials'
import { generateInputType } from './types'
import { EventDeclaration, EventArgDeclaration } from 'typechain'

export function codegenForEventsTypeMap(events: Dictionary<EventDeclaration[]>): string {
  return values(events)
    .map((e) => e[0])
    .filter((e) => !e.isAnonymous)
    .map(
      (e: EventDeclaration) => `
      ${e.name}: {
        readonly eventFragment: EventFragment;
        readonly name: "${e.name}";
        readonly signature: "${generateEventSignature(e)}";
        readonly topic: "${keccak256(toUtf8Bytes(generateEventSignature(e)))}";
        readonly args: {
          ${generateWideEventTypes(e.inputs)}
        }
      }
    `,
    )
    .join('\n')
}

function generateWideEventTypes(eventArgs: EventArgDeclaration[]) {
  if (eventArgs.length === 0) {
    return ''
  }
  return (
    eventArgs
      .map((arg) => {
        return `${arg.name}: ${generateInputType(arg.type)}`
      })
      .join(',\n') + ',\n'
  )
}

export function generateEvents(event: EventDeclaration) {
  return `
  ${event.name}(${generateEventTypes(event.inputs)}): EventFilter;
`
}

export function generateInterfaceEventDescription(event: EventDeclaration): string {
  return `'${generateEventSignature(event)}': EventFragment;`
}

function generateEventSignature(event: EventDeclaration): string {
  return `${event.name}(${event.inputs.map((input: any) => input.type.originalType).join(',')})`
}


function generateEventTypes(eventArgs: EventArgDeclaration[]) {
  if (eventArgs.length === 0) {
    return ''
  }
  return (
    eventArgs
      .map((arg) => {
        return `${arg.name}: ${generateEventArgType(arg)}`
      })
      .join(', ') + ', '
  )
}

function generateEventArgType(eventArg: EventArgDeclaration): string {
  return eventArg.isIndexed ? `${generateInputType(eventArg.type)} | null` : 'null'
}


export function generateGetEventOverload(event: EventDeclaration): string {
  return `getEvent(nameOrSignatureOrTopic: '${event.name}'): EventFragment;`
}
