import knex from '#libs/knex.js'

export class TagRepo {
  public static async readTagsByEventId(eventId: number): Promise<{ id: number; name: string }[]> {
    return knex
      .select({ id: 'Term._id', name: 'Term.name' })
      .from('Event')
      .innerJoin('Taggable_tags_Term_taggables AS tags', 'Event.taggable', 'tags.taggables')
      .innerJoin('Term', 'tags.tags', 'Term._id')
      .where({ 'Event._id': eventId, 'Term.hidden': 0 })
      .orderBy('Term.priority')
  }
}
