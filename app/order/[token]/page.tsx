import MemberFormItems from "@/components/members/memberFormItems";
import { getMemberFormItemsFromToken } from "@/lib/actions/members";

export default async function OrderPage({ params }: { params: { token: string } }) {
    const {token} = params;
    const form = await getMemberFormItemsFromToken(token);

    return <MemberFormItems form={form} token={token} />;

}