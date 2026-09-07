import type { JournalAction, JournalEntity } from "@/lib/broiler/types";

export const ACTION_LABEL: Record<JournalAction, string> = {
  create: "Створено",
  update: "Змінено",
  delete: "Видалено",
  join: "Заявка",
  assign: "Призначено",
  restore: "Повернуто",
};

export const ENTITY_LABEL: Record<JournalEntity, string> = {
  report: "Звіт",
  flock: "Посадка",
  house: "Пташник",
  site: "Фабрика",
  staff: "Команда",
  org: "Господарство",
  invite: "Код",
  feed: "Корм",
};
