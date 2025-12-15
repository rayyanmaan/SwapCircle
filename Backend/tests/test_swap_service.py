from services import swap_service

def test_create_swap_request():
    req = swap_service.create_swap_request(
        item_id="item_test_1",
        requester_id="user_test_1",
        credits_required=1
    )

    assert req is not None
    assert req["item_id"] == "item_test_1"
    assert req["requester_id"] == "user_test_1"
    assert req["status"] == "pending"


def test_update_swap_request():
    req = swap_service.create_swap_request(
        item_id="item_test_2",
        requester_id="user_test_2",
        credits_required=2
    )

    updated = swap_service.update_swap_request(req["id"], "cancelled")
    assert updated["status"] == "cancelled"


def test_get_requests_for_requester():
    req = swap_service.create_swap_request(
        item_id="item_test_3",
        requester_id="user_abc",
        credits_required=1
    )

    results = swap_service.get_requests_for_requester("user_abc")
    assert any(r["id"] == req["id"] for r in results)
