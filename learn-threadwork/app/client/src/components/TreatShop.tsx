// Exercise 7.4: TreatShop. Read curriculum/part-7/b-garden-and-treats.md first.
import type { Claimed, Harvest, Treat } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface TreatShopProps {
  treats: Treat[];
  harvests: Harvest[];
  claimed: Claimed[];
  onClaim: (treatId: string) => void;
  onAdd: (name: string, cost: number) => void;
}

/**
 * <section aria-label="Treat shop">:
 * - "<n> fruit to spend" (basketCount from 2.3)
 * - a list with each treat: name, "<cost> fruit", and a button "Claim <name>" (enabled when affordable) or, when
 *   not affordable, a disabled button "<missing> more fruit" with aria-label "Claim <name>".
 * - a form "Add your own treat": inputs "Treat" and "Cost" (number, default 5) and a button "Add treat".
 *   Calls onAdd(name, cost) when the name is not empty, then clears the name.
 * - "Claimed" list: the last 5 claims, newest first: "<name> · <day>"
 */
export function TreatShop(props: TreatShopProps) {
  // TODO 7.4
  return <Todo exercise="7.4" what="The treat shop" />;
}
