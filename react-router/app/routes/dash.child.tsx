export function loader({ params }: { params: { id: string } }) {
  return { id: params.id };
}

export function ServerComponent({ loaderData }: { loaderData: { id: string } }) {
  return (
    <p className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      child {loaderData.id} rendered at {new Date().toISOString()}
    </p>
  );
}
