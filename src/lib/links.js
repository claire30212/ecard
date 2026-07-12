export function buildCardLink(id, adminKey) {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return adminKey ? `${base}?id=${id}&admin=${adminKey}` : `${base}?id=${id}`
}

export function buildRecipientLink(id, recipientKey) {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}?id=${id}&recipient=${recipientKey}`
}

export function buildMyCardsLink() {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}?view=my-cards`
}
