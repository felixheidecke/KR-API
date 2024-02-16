import { ErrorCodes, ModuleError } from '../../../common/decorators/Error.js'
import { DetailLevel } from '../../shop/utils/detail-level.js'
import { EventRepository } from '../repositories/EventRepository.js'
import { Event } from '../model/Event.js'

export class EventService {
  public static async getEvent(module: number, id: number) {
    const event = await EventRepository.getEvent(module, id)

    if (!event) {
      throw new ModuleError('Event not found', ErrorCodes.NOT_FOUND)
    }

    return event
  }

  public static async getEvents(module: number, query?: any, detailLevel?: DetailLevel) {
    const events = await EventRepository.getEvents(module, query, detailLevel)

    if (!events) {
      throw new ModuleError('Event not found', ErrorCodes.NOT_FOUND)
    }

    return events
  }
}
