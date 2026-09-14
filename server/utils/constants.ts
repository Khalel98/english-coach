// Single-user app for now. Every row that will need a user scope already
// carries this id, so introducing real multi-user auth later only means
// replacing this constant with a real user id — not changing the schema.
export const OWNER_USER_ID = 'owner'
