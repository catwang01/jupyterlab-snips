import json


async def test_get_example(jp_fetch):
    # When
    response = await jp_fetch("jupyterlab-snips", "get-example")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "data": "This is /jupyterlab-snips/get-example endpoint!"
    }