"""Helpers for partial model updates."""


def apply_updates_and_save(instance, update_data) -> None:
    """Set the given fields on ``instance`` and save only those columns.

    ``instance.save()`` rewrites every column from a (possibly cached, hence
    stale) copy, which can silently overwrite a concurrent change to another
    column. This writes just the fields that were set, plus ``updated_at``
    (``auto_now`` fields are only written when listed in ``update_fields``).
    Same fields set, same ``updated_at`` bump, same returned instance.
    """
    concrete = {f.name for f in instance._meta.concrete_fields}
    changed = []
    for field, value in update_data.items():
        if hasattr(instance, field) and value is not None:
            setattr(instance, field, value)
            if field in concrete:
                changed.append(field)

    if "updated_at" in concrete and "updated_at" not in changed:
        changed.append("updated_at")
    if changed:
        instance.save(update_fields=changed)
