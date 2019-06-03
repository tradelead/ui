export default async function formatMutateError(mutate) {
  try {
    return await mutate;
  } catch (e) {
    e.errors = e.graphQLErrors;
    throw e;
  }
}
