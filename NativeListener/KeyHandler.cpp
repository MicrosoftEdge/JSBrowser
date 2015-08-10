#include "KeyHandler.h"

using namespace NativeListener;
using namespace Platform;
using namespace std;
using namespace Windows::UI::Core;

KeyHandler::KeyHandler()
{
	// Must run on App UI thread
	m_dispatcher = Windows::UI::Core::CoreWindow::GetForCurrentThread()->Dispatcher;
}

void KeyHandler::setKeyCombination(int keyPress)
{
	m_dispatcher->RunAsync(
		CoreDispatcherPriority::Normal,
		ref new DispatchedHandler([this, keyPress]
	{
		NotifyAppEvent(keyPress);
	}));
}
